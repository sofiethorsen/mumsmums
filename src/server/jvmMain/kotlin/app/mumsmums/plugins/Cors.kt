package app.mumsmums.plugins

import io.ktor.http.HttpHeaders
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS

fun Application.configureCORS() {
    install(CORS) {
        allowSameOrigin = true
        allowCredentials = true
        allowHost("localhost:3000")
        allowHost("localhost:8080")
        allowHost("mumsmums.app", schemes = listOf("http", "https"))
        allowHeader(HttpHeaders.ContentType)
    }
}
