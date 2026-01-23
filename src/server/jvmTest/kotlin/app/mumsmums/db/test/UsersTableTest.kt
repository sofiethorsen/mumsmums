package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.UsersTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.time.TimeProvider
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class UsersTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private val mockTimeProvider = mockk<TimeProvider>()
    private lateinit var connection: DatabaseConnection
    private lateinit var usersTable: UsersTable

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        usersTable = UsersTable(connection, mockIdGenerator, mockTimeProvider)
    }

    @Test
    fun `When creating a user, it should be stored with generated ID`() {
        val userId = 123456789L
        val timestamp = 1000000L
        every { mockIdGenerator.generateId() } returns userId
        every { mockTimeProvider.currentTimeMillis() } returns timestamp

        val user = usersTable.createUser("test@example.com", "hashedPassword123")

        assertEquals(userId, user.userId)
        assertEquals("test@example.com", user.email)
        assertEquals("hashedPassword123", user.passwordHash)
        assertEquals(timestamp, user.createdAtInMillis)
        assertEquals(timestamp, user.lastUpdatedAtInMillis)
    }

    @Test
    fun `When finding a user by email, it should return the user`() {
        val userId = 123456789L
        every { mockIdGenerator.generateId() } returns userId
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L
        usersTable.createUser("test@example.com", "hashedPassword123")

        val found = usersTable.findByEmail("test@example.com")

        assertNotNull(found)
        assertEquals(userId, found?.userId)
        assertEquals("test@example.com", found?.email)
        assertEquals("hashedPassword123", found?.passwordHash)
    }

    @Test
    fun `When finding a user by email that does not exist, it should return null`() {
        val found = usersTable.findByEmail("nonexistent@example.com")

        assertNull(found)
    }

    @Test
    fun `When finding a user by ID, it should return the user`() {
        val userId = 123456789L
        every { mockIdGenerator.generateId() } returns userId
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L
        usersTable.createUser("test@example.com", "hashedPassword123")

        val found = usersTable.findById(userId)

        assertNotNull(found)
        assertEquals("test@example.com", found?.email)
    }

    @Test
    fun `When finding a user by ID that does not exist, it should return null`() {
        val found = usersTable.findById(999999999L)

        assertNull(found)
    }

    @Test
    fun `When updating password hash, it should update and return true`() {
        val userId = 123456789L
        val createTime = 1000000L
        val updateTime = 2000000L
        every { mockIdGenerator.generateId() } returns userId
        every { mockTimeProvider.currentTimeMillis() } returns createTime

        usersTable.createUser("test@example.com", "oldPassword")

        every { mockTimeProvider.currentTimeMillis() } returns updateTime
        val result = usersTable.updatePasswordHash(userId, "newPassword")

        assertTrue(result)
        val updated = usersTable.findById(userId)
        assertEquals("newPassword", updated?.passwordHash)
        assertEquals(createTime, updated?.createdAtInMillis)
        assertEquals(updateTime, updated?.lastUpdatedAtInMillis)
    }

    @Test
    fun `When updating password hash for non-existent user, it should return false`() {
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L

        val result = usersTable.updatePasswordHash(999999999L, "newPassword")

        assertFalse(result)
    }

    @Test
    fun `When creating a user with duplicate email, it should throw exception`() {
        val userIdOne = 123456789L
        val userIdTwo = 987654321L
        every { mockIdGenerator.generateId() } returns userIdOne andThen userIdTwo
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L

        usersTable.createUser("duplicate@example.com", "password1")

        assertThrows<SQLException> {
            usersTable.createUser("duplicate@example.com", "password2")
        }
    }
}
