package app.mumsmums.auth.test

import app.mumsmums.auth.JwtConfig
import com.auth0.jwt.exceptions.JWTVerificationException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class JwtConfigTest {

    private val jwtConfig = JwtConfig(
        secret = JwtConfig.Secret("test-secret"),
        issuer = JwtConfig.Issuer("test-issuer"),
        audience = JwtConfig.Audience("test-audience"),
        validityMs = 60 * 1000L // 1 minute for testing
    )

    @Test
    fun `When generating a token, it should contain the correct claims`() {
        val userId = 123456789L
        val email = "test@example.com"

        val token = jwtConfig.generateToken(userId, email)

        val decodedJwt = jwtConfig.verifier.verify(token)
        assertEquals(userId, decodedJwt.getClaim("userId").asLong())
        assertEquals(email, decodedJwt.getClaim("email").asString())
    }

    @Test
    fun `When verifying a valid token, it should succeed`() {
        val token = jwtConfig.generateToken(123456789L, "test@example.com")

        val decodedJwt = jwtConfig.verifier.verify(token)

        assertNotNull(decodedJwt)
        assertEquals("test-issuer", decodedJwt.issuer)
    }

    @Test
    fun `When verifying a token with wrong secret, it should fail`() {
        val token = jwtConfig.generateToken(123456789L, "test@example.com")

        val differentConfig = JwtConfig(
            secret = JwtConfig.Secret("different-secret"),
            issuer = JwtConfig.Issuer("test-issuer"),
            audience = JwtConfig.Audience("test-audience"),
        )

        assertThrows<JWTVerificationException> {
            differentConfig.verifier.verify(token)
        }
    }

    @Test
    fun `When generating tokens for different users, they should be different`() {
        val token1 = jwtConfig.generateToken(1L, "user1@example.com")
        val token2 = jwtConfig.generateToken(2L, "user2@example.com")

        assertNotEquals(token1, token2)
    }

    @Test
    fun `When verifying an expired token, it should fail`() {
        val expiredConfig = JwtConfig(
            secret = JwtConfig.Secret("test-secret"),
            issuer = JwtConfig.Issuer("test-issuer"),
            audience = JwtConfig.Audience("test-audience"),
            validityMs = -1000L // Already expired
        )
        val token = expiredConfig.generateToken(123456789L, "test@example.com")

        assertThrows<JWTVerificationException> {
            expiredConfig.verifier.verify(token)
        }
    }
}
