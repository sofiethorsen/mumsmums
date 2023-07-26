package app.mumsmums.plugins

import app.mumsmums.environment.Environment
import io.ktor.server.application.Application
import io.ktor.server.http.content.singlePageApplication
import io.ktor.server.routing.routing

fun Application.configureRouting() {
    routing {
        singlePageApplication {
            filesPath = Environment.getPathToJs()
        }
    }
}
