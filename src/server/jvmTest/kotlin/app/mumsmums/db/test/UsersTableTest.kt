package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.UsersTable
import app.mumsmums.time.TimeProvider
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class UsersTableTest {
    private val mockTimeProvider = mockk<TimeProvider>()
    private lateinit var connection: DatabaseConnection
    private lateinit var usersTable: UsersTable

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        usersTable = UsersTable(connection, mockTimeProvider)
    }

    @Test
    fun `When finding a user by email, it should return the user`() {
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L
        val created = usersTable.createUser("test@example.com", "hashedPassword123")

        val found = usersTable.findByEmail("test@example.com")

        assertNotNull(found)
        assertEquals(created.userId, found?.userId)
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
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L
        val created = usersTable.createUser("test@example.com", "hashedPassword123")

        val found = usersTable.findById(created.userId)

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
        val createTime = 1000000L
        val updateTime = 2000000L
        every { mockTimeProvider.currentTimeMillis() } returns createTime

        val created = usersTable.createUser("test@example.com", "oldPassword")

        every { mockTimeProvider.currentTimeMillis() } returns updateTime
        val result = usersTable.updatePasswordHash(created.userId, "newPassword")

        assertTrue(result)
        val updated = usersTable.findById(created.userId)
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
        every { mockTimeProvider.currentTimeMillis() } returns 1000000L

        usersTable.createUser("duplicate@example.com", "password1")

        assertThrows<SQLException> {
            usersTable.createUser("duplicate@example.com", "password2")
        }
    }
}
