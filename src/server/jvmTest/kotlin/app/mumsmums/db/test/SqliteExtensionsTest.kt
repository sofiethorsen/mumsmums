package app.mumsmums.db.test

import app.mumsmums.db.getNullableFloat
import app.mumsmums.db.getNullableInt
import app.mumsmums.db.getNullableLong
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.sql.Connection
import java.sql.DriverManager

class SqliteExtensionsTest {
    private lateinit var connection: Connection

    @BeforeEach
    fun setUp() {
        // Create an in-memory SQLite database for testing
        connection = DriverManager.getConnection("jdbc:sqlite::memory:")

        // Create a test table with various column types
        connection.createStatement().use { statement ->
            statement.execute(
                """
                CREATE TABLE test_types (
                    int_col INTEGER,
                    long_col INTEGER,
                    float_col REAL,
                    null_col INTEGER
                )
                """.trimIndent()
            )
        }
    }

    @AfterEach
    fun tearDown() {
        connection.close()
    }

    @Test
    fun `getNullableInt should handle Int values`() {
        // Insert a small integer value
        connection.prepareStatement("INSERT INTO test_types (int_col) VALUES (?)").use { stmt ->
            stmt.setInt(1, 42)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT int_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableInt("int_col")
        assertEquals(42, result)
    }

    @Test
    fun `getNullableInt should handle Long values by converting to Int`() {
        // Insert a value that SQLite might return as Long
        connection.prepareStatement("INSERT INTO test_types (int_col) VALUES (?)").use { stmt ->
            stmt.setLong(1, 123456L)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT int_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableInt("int_col")
        assertEquals(123456, result)
    }

    @Test
    fun `getNullableInt should return null for NULL values`() {
        connection.prepareStatement("INSERT INTO test_types (int_col) VALUES (NULL)").use { stmt ->
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT int_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableInt("int_col")
        assertNull(result)
    }

    @Test
    fun `getNullableLong should handle Long values`() {
        connection.prepareStatement("INSERT INTO test_types (long_col) VALUES (?)").use { stmt ->
            stmt.setLong(1, 9876543210L)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT long_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableLong("long_col")
        assertEquals(9876543210L, result)
    }

    @Test
    fun `getNullableLong should handle Int values by converting to Long`() {
        connection.prepareStatement("INSERT INTO test_types (long_col) VALUES (?)").use { stmt ->
            stmt.setInt(1, 42)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT long_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableLong("long_col")
        assertEquals(42L, result)
    }

    @Test
    fun `getNullableLong should return null for NULL values`() {
        connection.prepareStatement("INSERT INTO test_types (long_col) VALUES (NULL)").use { stmt ->
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT long_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableLong("long_col")
        assertNull(result)
    }

    @Test
    fun `getNullableFloat should handle Double values by converting to Float`() {
        connection.prepareStatement("INSERT INTO test_types (float_col) VALUES (?)").use { stmt ->
            stmt.setDouble(1, 3.14159)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT float_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableFloat("float_col")
        assertNotNull(result)
        assertEquals(3.14159f, result!!, 0.00001f)
    }

    @Test
    fun `getNullableFloat should return null for NULL values`() {
        connection.prepareStatement("INSERT INTO test_types (float_col) VALUES (NULL)").use { stmt ->
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT float_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableFloat("float_col")
        assertNull(result)
    }

    @Test
    fun `getNullableFloat should handle zero values`() {
        connection.prepareStatement("INSERT INTO test_types (float_col) VALUES (?)").use { stmt ->
            stmt.setDouble(1, 0.0)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT float_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableFloat("float_col")
        assertNotNull(result)
        assertEquals(0.0f, result!!)
    }

    @Test
    fun `getNullableInt should handle negative values`() {
        connection.prepareStatement("INSERT INTO test_types (int_col) VALUES (?)").use { stmt ->
            stmt.setInt(1, -42)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT int_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableInt("int_col")
        assertEquals(-42, result)
    }

    @Test
    fun `getNullableLong should handle negative values`() {
        connection.prepareStatement("INSERT INTO test_types (long_col) VALUES (?)").use { stmt ->
            stmt.setLong(1, -9876543210L)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT long_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableLong("long_col")
        assertEquals(-9876543210L, result)
    }

    @Test
    fun `getNullableFloat should handle negative values`() {
        connection.prepareStatement("INSERT INTO test_types (float_col) VALUES (?)").use { stmt ->
            stmt.setDouble(1, -2.71828)
            stmt.executeUpdate()
        }

        val resultSet = connection.createStatement().executeQuery("SELECT float_col FROM test_types")
        assertTrue(resultSet.next())

        val result = resultSet.getNullableFloat("float_col")
        assertNotNull(result)
        assertEquals(-2.71828f, result!!, 0.00001f)
    }
}
