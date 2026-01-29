package app.mumsmums.plugins

import app.mumsmums.db.RecipeRepository
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.images.ImageUploadHandler
import app.mumsmums.images.ImageUploadResult
import app.mumsmums.logging.getLoggerByClass
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.PartData
import io.ktor.http.content.forEachPart
import io.ktor.http.content.streamProvider
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receiveMultipart
import io.ktor.server.response.respond
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable

@Serializable
data class ImageUploadResponse(val success: Boolean, val message: String, val imageUrl: String? = null)

private val logger = getLoggerByClass<ImageUploadRoutes>()

// Marker class for logger
private class ImageUploadRoutes

fun Application.configureImageUpload(recipeRepository: RecipeRepository) {
    val uploadHandler = ImageUploadHandler(recipeRepository, MumsMumsPaths.getImagePath())

    routing {
        authenticate(AUTH_JWT_NAME) {
            post("/api/images/recipe/{recipeId}") {
                val recipeIdParam = call.parameters["recipeId"]
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ImageUploadResponse(false, "Recipe ID is required")
                    )

                val recipeId = recipeIdParam.toLongOrNull()
                    ?: return@post call.respond(
                        HttpStatusCode.BadRequest,
                        ImageUploadResponse(false, "Invalid recipe ID")
                    )

                var fileBytes: ByteArray? = null
                var contentType: String? = null

                try {
                    val multipart = call.receiveMultipart()
                    multipart.forEachPart { part ->
                        when (part) {
                            is PartData.FileItem -> {
                                fileBytes = part.streamProvider().readBytes()
                                contentType = part.contentType?.let { "${it.contentType}/${it.contentSubtype}" }
                                part.dispose()
                            }
                            else -> part.dispose()
                        }
                    }

                    if (fileBytes == null) {
                        return@post call.respond(
                            HttpStatusCode.BadRequest,
                            ImageUploadResponse(false, "No file uploaded")
                        )
                    }

                    // Delegate to handler
                    val result = uploadHandler.uploadImage(recipeId, fileBytes, contentType ?: "application/octet-stream")

                    // Convert result to HTTP response
                    when (result) {
                        is ImageUploadResult.Success -> {
                            call.respond(
                                HttpStatusCode.OK,
                                ImageUploadResponse(true, "Image uploaded successfully", result.imageUrl)
                            )
                        }
                        is ImageUploadResult.RecipeNotFound -> {
                            call.respond(
                                HttpStatusCode.NotFound,
                                ImageUploadResponse(false, "Recipe not found")
                            )
                        }
                        is ImageUploadResult.FileTooLarge -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ImageUploadResponse(false, "File too large. Maximum size is ${result.maxSize / 1024 / 1024}MB")
                            )
                        }
                        is ImageUploadResult.InvalidFormat -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ImageUploadResponse(false, "Invalid file format. Expected ${result.expected}, got ${result.actual}")
                            )
                        }
                        is ImageUploadResult.InvalidImageData -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ImageUploadResponse(false, "Invalid image file")
                            )
                        }
                        is ImageUploadResult.InvalidDimensions -> {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ImageUploadResponse(
                                    false,
                                    "Invalid image dimensions. Expected ${result.expectedWidth}x${result.expectedHeight}, got ${result.actualWidth}x${result.actualHeight}"
                                )
                            )
                        }
                        is ImageUploadResult.IOError -> {
                            call.respond(
                                HttpStatusCode.InternalServerError,
                                ImageUploadResponse(false, result.message)
                            )
                        }
                    }
                } catch (e: Exception) {
                    logger.error("Failed to process image upload for recipe $recipeId", e)
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        ImageUploadResponse(false, "Failed to upload image: ${e.message}")
                    )
                }
            }
        }
    }
}
