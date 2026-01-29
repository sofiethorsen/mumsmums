package app.mumsmums.plugins

import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.logging.getLoggerByClass
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondFile
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import java.io.File

private val logger = getLoggerByClass<StaticFiles>()

// Marker class for logger
private class StaticFiles

fun Application.configureStaticFiles() {
    val imageStoragePath = MumsMumsPaths.getImagePath()
    val imageDir = File(imageStoragePath)

    if (!imageDir.exists()) {
        logger.error("Image storage directory does not exist: $imageStoragePath")
        throw IllegalStateException("Image storage directory does not exist: $imageStoragePath. Please ensure the directory is created before starting the application.")
    }

    logger.info("Serving static images from: $imageStoragePath")

    routing {
        // Serve image files from persistent storage
        get("/images/{path...}") {
            val path = call.parameters.getAll("path")?.joinToString("/") ?: ""
            val file = File(imageDir, path)

            if (file.exists() && file.isFile) {
                call.respondFile(file)
            } else {
                call.respond(HttpStatusCode.NotFound)
            }
        }
    }
}
