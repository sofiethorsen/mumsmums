package app.mumsmums.auth

import at.favre.lib.crypto.bcrypt.BCrypt

/**
 * Handles password hashing and verification using BCrypt.
 */
object PasswordHasher {
    private const val COST = 12

    fun hash(password: String): String {
        return BCrypt.withDefaults().hashToString(COST, password.toCharArray())
    }

    fun verify(password: String, hash: String): Boolean {
        return BCrypt.verifyer().verify(password.toCharArray(), hash).verified
    }
}
