package app.mumsmums.identifiers

import java.net.InetAddress

/**
 * Use 12 bits for the machine ID based on the local IP address lower 12 bits.
 */
private const val bitsInMachineId = 12

/**
 * Use 29 bits for timestamp. It has a custom epoch (01/08/2023 @ 00:00 UTC) and second-precision.
 */
private const val bitsInTimestamp = 29

/**
 * Use 11 bits for counter. This would be able to generate 2048 ids per second, per machine. This is more than
 * enough for a hobby project. If to be used at a larger scale than that, we'd have to introduce a synchronous sleep
 * or similar, to force uniqueness.
 */
private const val bitsInCounter = 11

// Tuesday, 1 August 2023 00:00:00 UTC
const val epochOffset: Long = 1690848000

// Get the IP address of the machine, which is used for generating the numeric ID.
private fun getIpAddress(): InetAddress {
    return InetAddress.getLocalHost()
}

/**
 * Generates numeric IDs that combines the machine ID (derived from the IP address), a timestamp, and a counter. This
 * combination ensures that the generated numeric IDs are unique and monotonically increasing even when generated on
 * multiple machines concurrently (see above comments though).
 *
 * The numeric IDs are longs (52 bits) which is less than a UUID (128 bits) and makes for faster indexing and simpler
 * comparisons.
 */
class NumericIdGenerator(
        private val ipAddress: InetAddress = getIpAddress(),
        private val currentTimestampMillis: () -> Long = { System.currentTimeMillis() },
        private val counterStart: Int = 0,
) {
    // Get the raw IP address in the in network byte order, highest order byte is in the first octet.
    private val ipAddressBytes = ipAddress.address

    init {
        println("DEBUG NumericIdGenerator: IP address: ${ipAddress.hostAddress}, bytes size: ${ipAddressBytes.size}, raw: ${ipAddressBytes.contentToString()}")
    }

    // Convert the IP address (IPv4 or IPv6) into a Long for use as machine ID.
    // For IPv4: use all 4 bytes
    // For IPv6: use the last 4 bytes (interface identifier portion)
    //
    // For an example IPv4 address like 192.168.1.10:
    // - The ipAddressBytes array would look like [192, 168, 1, 10].
    // - Together this results in: 3221225472 + 1101004800 + 256 + 10 = 3232235786
    //
    // For an IPv6 address, we use the last 4 bytes which typically contain the interface identifier.
    private val ipAddressAsLong: Long = when (ipAddressBytes.size) {
        4 -> {
            // IPv4: use all 4 bytes
            ((ipAddressBytes[0].toLong() and 0xFFL) shl (3 * 8)) +
                    ((ipAddressBytes[1].toLong() and 0xFFL) shl (2 * 8)) +
                    ((ipAddressBytes[2].toLong() and 0xFFL) shl (1 * 8)) +
                    (ipAddressBytes[3].toLong() and 0xFFL)
        }
        16 -> {
            // IPv6: use last 4 bytes
            ((ipAddressBytes[12].toLong() and 0xFFL) shl (3 * 8)) +
                    ((ipAddressBytes[13].toLong() and 0xFFL) shl (2 * 8)) +
                    ((ipAddressBytes[14].toLong() and 0xFFL) shl (1 * 8)) +
                    (ipAddressBytes[15].toLong() and 0xFFL)
        }
        else -> {
            // Fallback: use hashCode if we get an unexpected address format
            ipAddress.hashCode().toLong() and 0xFFFFFFFFL
        }
    }

    // Calculate the machine ID bits by combining the IP address with timestamp and counter bits.
    private val machineIdBit = (ipAddressAsLong and ((1L shl bitsInMachineId) - 1)) shl
            (bitsInTimestamp + bitsInCounter)

    // Initialize the last timestamp and the counter for generating numeric IDs.
    private var lastTimestamp: Long = currentTimestampMillis() / 1000L - epochOffset
    private var counter = counterStart

    // Generate a new numeric ID based on the current timestamp and the machine ID.
    fun generateId(): Long {
        val currentTimestamp = currentTimestampMillis() / 1000L - epochOffset

        // If the timestamp has advanced, reset the counter.
        if (currentTimestamp > lastTimestamp) {
            lastTimestamp = currentTimestamp
            counter = 0
        }

        val counterToReturn = counter
        counter += 1

        // Combine machine ID, timestamp, and counter bits to create a unique numeric ID.
        val timestampBit = (lastTimestamp and ((1L shl bitsInTimestamp) - 1)) shl bitsInCounter
        val counterBit = (counterToReturn and ((1 shl bitsInCounter) - 1)).toLong()

        // lastly mask the 52 bits
        return (machineIdBit or timestampBit or counterBit) and 0x000FFFFFFFFFFFFFL
    }
}
