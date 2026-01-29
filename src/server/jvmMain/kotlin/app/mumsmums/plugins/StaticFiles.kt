package app.mumsmums.plugins

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

// Get image storage path from environment - in a Docker context, this will
// be /app/images as per the docker-compose.yml configuration; however in local
// dev, we'll simply default to a directory in the user's home folder.
private fun getImageStoragePath(): String {
    return System.getenv("IMAGE_STORAGE_PATH")
        ?: "${System.getProperty("user.home")}/mumsmums-persist/images"
}

fun Application.configureStaticFiles() {
    val imageStoragePath = getImageStoragePath()
    val imageDir = File(imageStoragePath)

    // On fresh deployments and in CI, the image directory does not exist yet and we need to create it
    if (!imageDir.exists()) {
        logger.info("Image storage directory does not exist: $imageStoragePath")
        logger.info("Creating image storage directory...")
        if (!imageDir.mkdirs()) {
            logger.error("Failed to create image storage directory: $imageStoragePath")
            throw IllegalStateException("Failed to create image storage directory: $imageStoragePath")
        }
        logger.info("Successfully created image storage directory")
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
