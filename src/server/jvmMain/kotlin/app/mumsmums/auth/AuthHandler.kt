package app.mumsmums.auth

import app.mumsmums.db.UsersTable
import app.mumsmums.model.User

/**
 * Result of an authentication attempt.
 */
sealed class AuthResult {
    data class Success(val user: User) : AuthResult()
    data class UserNotFound(val email: String) : AuthResult()
    data object InvalidPassword : AuthResult()
}

/**
 * Handles authentication logic.
 */
class AuthHandler(private val usersTable: UsersTable) {

    /**
     * Authenticates a user with email and password.
     */
    fun authenticate(email: String, password: String): AuthResult {
        val user = usersTable.findByEmail(email)
            ?: return AuthResult.UserNotFound(email)
        return if (PasswordHasher.verify(password, user.passwordHash)) {
            AuthResult.Success(user)
        } else {
            AuthResult.InvalidPassword
        }
    }

    /**
     * Creates a new admin user with the given email and password.
     */
    fun createAdminUser(email: String, password: String): User {
        val passwordHash = PasswordHasher.hash(password)
        return usersTable.createUser(email, passwordHash)
    }
}
