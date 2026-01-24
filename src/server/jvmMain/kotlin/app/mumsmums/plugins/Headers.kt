package app.mumsmums.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.forwardedheaders.ForwardedHeaders

fun Application.configureHeaders() {
    install(ForwardedHeaders)
}
