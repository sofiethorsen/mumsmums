package app.mumsmums.auth.test

import app.mumsmums.auth.AuthHandler
import app.mumsmums.auth.AuthResult
import app.mumsmums.auth.PasswordHasher
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.UsersTable
import app.mumsmums.time.TimeProvider
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class AuthHandlerTest {
    private val mockTimeProvider = mockk<TimeProvider>()
    private lateinit var connection: DatabaseConnection
    private lateinit var usersTable: UsersTable
    private lateinit var authHandler: AuthHandler

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        usersTable = UsersTable(connection, mockTimeProvider)
        authHandler = AuthHandler(usersTable)

        every { mockTimeProvider.currentTimeMillis() } returns 1000000L
    }

    @Test
    fun `When authenticating with valid credentials, it should return Success with user`() {
        val passwordHash = PasswordHasher.hash("password123")
        val created = usersTable.createUser("admin@example.com", passwordHash)

        val result = authHandler.authenticate("admin@example.com", "password123")

        assertTrue(result is AuthResult.Success)
        val user = (result as AuthResult.Success).user
        assertEquals(created.userId, user.userId)
        assertEquals("admin@example.com", user.email)
    }

    @Test
    fun `When authenticating with wrong password, it should return InvalidPassword`() {
        val passwordHash = PasswordHasher.hash("password123")
        usersTable.createUser("admin@example.com", passwordHash)

        val result = authHandler.authenticate("admin@example.com", "wrongPassword")

        assertTrue(result is AuthResult.InvalidPassword)
    }

    @Test
    fun `When authenticating with non-existent email, it should return UserNotFound`() {
        val result = authHandler.authenticate("nonexistent@example.com", "password123")

        assertTrue(result is AuthResult.UserNotFound)
        assertEquals("nonexistent@example.com", (result as AuthResult.UserNotFound).email)
    }
}
