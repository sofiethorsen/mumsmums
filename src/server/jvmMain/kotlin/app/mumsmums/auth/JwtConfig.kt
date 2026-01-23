package app.mumsmums.auth

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import java.util.Date

private const val USER_ID_CLAIM = "userId"
private const val USER_EMAIL_CLAIM = "email"
private const val DEFAULT_VALIDITY_IN_MS = 24 * 60 * 60 * 1000L // 24 hours

/**
 * Configuration and utilities for JWT token generation and verification.
 */
class JwtConfig(
    private val secret: Secret,
    private val issuer: Issuer,
    private val audience: Audience,
    private val validityMs: Long = DEFAULT_VALIDITY_IN_MS,
) {
    private val algorithm: Algorithm = Algorithm.HMAC256(secret.value)

    val verifier: JWTVerifier = JWT.require(algorithm)
        .withIssuer(issuer.value)
        .withAudience(audience.value)
        .build()

    val validitySeconds: Int = (validityMs / 1000).toInt()

    fun generateToken(userId: Long, email: String): String {
        return JWT.create()
            .withIssuer(issuer.value)
            .withAudience(audience.value)
            .withClaim(USER_ID_CLAIM, userId)
            .withClaim(USER_EMAIL_CLAIM, email)
            .withExpiresAt(Date(System.currentTimeMillis() + validityMs))
            .sign(algorithm)
    }

    data class Secret(val value: String)

    data class Issuer(val value: String)

    data class Audience(val value: String)
}
