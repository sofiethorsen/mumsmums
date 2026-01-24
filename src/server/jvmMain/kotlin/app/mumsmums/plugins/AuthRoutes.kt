package app.mumsmums.plugins

import app.mumsmums.auth.AuthHandler
import app.mumsmums.auth.AuthResult
import app.mumsmums.auth.JwtConfig
import app.mumsmums.logging.getLoggerByClass
import io.ktor.http.Cookie
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class LoginResponse(val success: Boolean, val message: String)

@Serializable
data class AuthStatusResponse(val authenticated: Boolean, val email: String? = null)

private val logger = getLoggerByClass<AuthRoutes>()

// Marker class for logger
private class AuthRoutes

fun Application.configureAuthRoutes(authHandler: AuthHandler, jwtConfig: JwtConfig, secureCookies: Boolean) {
    routing {
        post("/api/auth/login") {
            val request = call.receive<LoginRequest>()

            when (val result = authHandler.authenticate(request.email, request.password)) {
                is AuthResult.Success -> {
                    val token = jwtConfig.generateToken(result.user.userId, result.user.email)

                    // Manually set cookie to bypass Ktor's HTTPS check when behind reverse proxy
                    if (secureCookies) {
                        val cookieHeader = buildString {
                            append("$AUTH_COOKIE_NAME=$token; ")
                            append("Path=/; ")
                            append("Max-Age=${jwtConfig.validitySeconds}; ")
                            append("HttpOnly; ")
                            append("Secure; ")
                            append("SameSite=Strict")
                        }
                        call.response.headers.append("Set-Cookie", cookieHeader)
                    } else {
                        call.response.cookies.append(
                            Cookie(
                                name = AUTH_COOKIE_NAME,
                                value = token,
                                httpOnly = true,
                                secure = false,
                                path = "/",
                                maxAge = jwtConfig.validitySeconds,
                                extensions = mapOf("SameSite" to "Strict")
                            )
                        )
                    }

                    logger.info("User logged in: {}", result.user.email)
                    call.respond(LoginResponse(success = true, message = "Login successful"))
                }
                is AuthResult.UserNotFound -> {
                    logger.warn("Login attempt for non-existent user: {}", result.email)
                    call.respond(HttpStatusCode.Unauthorized, LoginResponse(success = false, message = "Invalid credentials"))
                }
                is AuthResult.InvalidPassword -> {
                    logger.warn("Invalid password attempt for user: {}", request.email)
                    call.respond(HttpStatusCode.Unauthorized, LoginResponse(success = false, message = "Invalid credentials"))
                }
            }
        }

        post("/api/auth/logout") {
            call.response.cookies.append(
                Cookie(
                    name = AUTH_COOKIE_NAME,
                    value = "",
                    httpOnly = true,
                    path = "/",
                    maxAge = 0
                )
            )
            logger.info("User logged out")
            call.respond(LoginResponse(success = true, message = "Logged out"))
        }

        authenticate(AUTH_JWT_NAME) {
            get("/api/auth/status") {
                val principal = call.principal<JWTPrincipal>()
                val email = principal?.payload?.getClaim("email")?.asString()
                call.respond(AuthStatusResponse(authenticated = true, email = email))
            }
        }
    }
}
