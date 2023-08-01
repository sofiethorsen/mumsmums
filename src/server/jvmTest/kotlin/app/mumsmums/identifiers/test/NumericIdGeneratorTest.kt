package app.mumsmums.identifiers.test

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.identifiers.epochOffset
import io.mockk.every
import io.mockk.mockk
import java.net.InetAddress
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class NumericIdGeneratorTest {
    private val currentTimestampMillis = mockk<() -> Long>()
    private val counter = 0

    @Test
    fun `When generating IDs, 12 bits are used for the machine part`() {
        every { currentTimestampMillis.invoke() } answers { epochOffset * 1000L }
        val inetAddress = InetAddress.getByName("255.255.255.255")
        val idGenerator = NumericIdGenerator(inetAddress, currentTimestampMillis, counter)

        val id = idGenerator.generateId()

        Assertions.assertEquals(id, 0x000FFF0000000000L)
    }

    @Test
    fun `When generating IDs, 29 bits are used for the timestamp part`() {
        every { currentTimestampMillis.invoke() } answers { (0xFFFFFFFFFFL + epochOffset) * 1000L }
        val inetAddress = InetAddress.getByName("0.0.0.0")
        val idGenerator = NumericIdGenerator(inetAddress, currentTimestampMillis, counter)

        val id = idGenerator.generateId()

        Assertions.assertEquals(id,  0x000000FFFFFFF800L)
    }

    @Test
    fun `When generating IDs, 12 bits are used for the counter part`() {
        every { currentTimestampMillis.invoke() } answers { epochOffset * 1000L }
        val inetAddress = InetAddress.getByName("0.0.0.0")
        val maxCounter = (1 shl 11) - 1
        val idGenerator = NumericIdGenerator(inetAddress, currentTimestampMillis, maxCounter)

        val id = idGenerator.generateId()

        Assertions.assertEquals(id,  maxCounter.toLong())
    }

    @Test
    fun `When generating IDs, the counter is incremented`() {
        every { currentTimestampMillis.invoke() } answers { epochOffset * 1000L }
        val inetAddress = InetAddress.getByName("0.0.0.0")
        val idGenerator = NumericIdGenerator(inetAddress, currentTimestampMillis, 0)

        Assertions.assertEquals(idGenerator.generateId(), 0)
        Assertions.assertEquals(idGenerator.generateId(), 1)
        Assertions.assertEquals(idGenerator.generateId(), 2)
        Assertions.assertEquals(idGenerator.generateId(), 3)
        Assertions.assertEquals(idGenerator.generateId(), 4)
        Assertions.assertEquals(idGenerator.generateId(), 5)
        Assertions.assertEquals(idGenerator.generateId(), 6)
    }

    @Test
    fun `When generating IDs, the counter is reset when the timestamp changes`() {
        every { currentTimestampMillis.invoke() } answers { epochOffset * 1000L }
        val inetAddress = InetAddress.getByName("0.0.0.0")
        val idGenerator = NumericIdGenerator(inetAddress, currentTimestampMillis, 0)

        Assertions.assertEquals(idGenerator.generateId(), 0)
        Assertions.assertEquals(idGenerator.generateId(), 1)

        every { currentTimestampMillis.invoke() } answers { epochOffset * 1000L + 1000L }

        Assertions.assertEquals(idGenerator.generateId(), 2048)
        Assertions.assertEquals(idGenerator.generateId(), 2049)
    }
}
