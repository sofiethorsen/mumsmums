package app.mumsmums.plugins

import app.mumsmums.auth.JwtConfig
import io.ktor.http.HttpStatusCode
import io.ktor.http.auth.HttpAuthHeader
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.response.respond

const val AUTH_COOKIE_NAME = "auth_token"
const val AUTH_JWT_NAME = "auth-jwt"

fun Application.configureAuth(jwtConfig: JwtConfig) {
    install(Authentication) {
        jwt(AUTH_JWT_NAME) {
            verifier(jwtConfig.verifier)
            validate { credential ->
                val userId = credential.payload.getClaim("userId").asLong()
                val email = credential.payload.getClaim("email").asString()
                if (userId != null && email != null) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid or expired token"))
            }
            authHeader { call ->
                val token = call.request.cookies[AUTH_COOKIE_NAME]
                if (token != null) {
                    HttpAuthHeader.Single("Bearer", token)
                } else {
                    null
                }
            }
        }
    }
}
