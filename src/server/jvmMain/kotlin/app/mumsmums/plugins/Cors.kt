package app.mumsmums.plugins

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS

fun Application.configureCORS() {
    install(CORS) {
        allowSameOrigin = true
        allowCredentials = true
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Get)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Cookie)
        exposeHeader(HttpHeaders.SetCookie)
        allowHost("localhost:3000")
        allowHost("localhost:8080")
        allowHost("mumsmums.app", schemes = listOf("http", "https"))
    }
}
