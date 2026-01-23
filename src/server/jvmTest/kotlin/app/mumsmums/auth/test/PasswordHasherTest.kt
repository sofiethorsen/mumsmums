package app.mumsmums.auth.test

import app.mumsmums.auth.PasswordHasher
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class PasswordHasherTest {

    @Test
    fun `When hashing a password, it should return a BCrypt hash`() {
        val password = "mySecretPassword123"

        val hash = PasswordHasher.hash(password)

        assertTrue(hash.startsWith("\$2a\$"))
        assertNotEquals(password, hash)
    }

    @Test
    fun `When verifying correct password, it should return true`() {
        val password = "mySecretPassword123"
        val hash = PasswordHasher.hash(password)

        val result = PasswordHasher.verify(password, hash)

        assertTrue(result)
    }

    @Test
    fun `When verifying incorrect password, it should return false`() {
        val password = "mySecretPassword123"
        val wrongPassword = "wrongPassword"
        val hash = PasswordHasher.hash(password)

        val result = PasswordHasher.verify(wrongPassword, hash)

        assertFalse(result)
    }

    @Test
    fun `When hashing same password twice, it should produce different hashes`() {
        val password = "mySecretPassword123"

        val hash1 = PasswordHasher.hash(password)
        val hash2 = PasswordHasher.hash(password)

        assertNotEquals(hash1, hash2)
        assertTrue(PasswordHasher.verify(password, hash1))
        assertTrue(PasswordHasher.verify(password, hash2))
    }
}
