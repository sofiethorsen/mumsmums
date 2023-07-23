package app.mumsmums

import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import app.mumsmums.plugins.configureRouting
import app.mumsmums.plugins.configureSecurity
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    configureSecurity()
    configureRouting()
    configureGraphQL()
    configureCORS()
}
