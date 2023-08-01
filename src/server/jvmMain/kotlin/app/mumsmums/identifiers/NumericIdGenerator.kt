package app.mumsmums.identifiers

import java.net.InetAddress

import com.amazonaws.util.EC2MetadataUtils

/**
 * Use 12 bits for the machine ID. When running on EC2, use the EC2 instance IP address lower 12 bits. This is
 * guaranteed to be unique as they are in a network with a 20 CIDR mask size, leaving 12 bits for the host address.
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
private const val epochOffset: Long = 1690848000

// Get the IP address of the machine, which is used for generating the numeric ID.
private fun getIpAddress(): InetAddress {
    return if (System.getProperty("os.name").startsWith("Mac")) InetAddress.getLocalHost()
    else InetAddress.getByName(EC2MetadataUtils.getPrivateIpAddress())
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

    // Convert the raw IPv4 address into a single 32-bit unsigned integer (i.e. Long in Kotlin) as the machine ID.
    // We do this by applying a bitmask on each octet, to ensure we get a positive value between 0 and 255.
    //
    // For an example, consider an IP address like 192.168.1.10.
    //
    // - The ipAddressBytes array would look like [192, 168, 1, 10].
    // - The first octet (ipAddressBytes[0]) is 192 (0xC0 in hexadecimal).
    // - The second octet (ipAddressBytes[1]) is 168 (0xA8 in hexadecimal).
    // - The third octet (ipAddressBytes[2]) is 1 (0x01 in hexadecimal).
    // - The fourth octet (ipAddressBytes[3]) is 10 (0x0A in hexadecimal).
    //
    // - ipAddressBytes[0].toLong() and 0xFFL is 192 and 0xFFL, which gives 192.
    // - 192 shl (3 * 8) shifts 192 to the left by 24 bits, giving 3221225472.
    // - ipAddressBytes[1].toLong() and 0xFFL is 168 and 0xFFL, which gives 168.
    // - 168 shl (2 * 8) shifts 168 to the left by 16 bits, giving 1101004800.
    // - ipAddressBytes[2].toLong() and 0xFFL is 1 and 0xFFL, which gives 1.
    // - 1 shl (1 * 8) shifts 1 to the left by 8 bits, giving 256.
    // - ipAddressBytes[3].toLong() and 0xFFL is 10 and 0xFFL, which gives 10.
    //
    // Together this results in the ID: 3221225472 + 1101004800 + 256 + 10 = 4328719366
    private val ipAddressAsLong: Long =
            ((ipAddressBytes[0].toLong() and 0xFFL) shl (3 * 8)) +
                    ((ipAddressBytes[1].toLong() and 0xFFL) shl (2 * 8)) +
                    ((ipAddressBytes[2].toLong() and 0xFFL) shl (1 * 8)) +
                    (ipAddressBytes[3].toLong() and 0xFFL)

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
