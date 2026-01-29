package app.mumsmums.images

import app.mumsmums.db.RecipeRepository
import app.mumsmums.logging.getLoggerByClass
import java.io.ByteArrayInputStream
import java.io.File
import javax.imageio.ImageIO

sealed class ImageUploadResult {
    data class Success(val imageUrl: String) : ImageUploadResult()
    data class RecipeNotFound(val recipeId: Long) : ImageUploadResult()
    data class FileTooLarge(val actualSize: Int, val maxSize: Int = MAX_FILE_SIZE) : ImageUploadResult()
    data class InvalidFormat(val expected: String = "image/webp", val actual: String) : ImageUploadResult()
    data object InvalidImageData : ImageUploadResult()
    data class InvalidDimensions(
        val expectedWidth: Int = EXPECTED_WIDTH,
        val expectedHeight: Int = EXPECTED_HEIGHT,
        val actualWidth: Int,
        val actualHeight: Int
    ) : ImageUploadResult()
    data class IOError(val message: String) : ImageUploadResult()

    companion object {
        const val MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
        const val EXPECTED_WIDTH = 1200
        const val EXPECTED_HEIGHT = 600
    }
}

private val logger = getLoggerByClass<ImageUploadHandler>()

class ImageUploadHandler(
    private val recipeRepository: RecipeRepository,
    private val imageStoragePath: String
) {
    /**
     * Upload and validate an image for a recipe.
     *
     * This method:
     * 1. Validates the recipe exists
     * 2. Validates file size
     * 3. Validates image format (WebP)
     * 4. Validates image dimensions (1200x600)
     * 5. Saves the image to disk
     * 6. Updates the recipe's imageUrl in the database
     *
     * @param recipeId The ID of the recipe to attach the image to
     * @param fileBytes The raw image file bytes
     * @param contentType The MIME type of the uploaded file (e.g., "image/webp")
     * @return ImageUploadResult indicating success or specific failure reason
     */
    fun uploadImage(recipeId: Long, fileBytes: ByteArray, contentType: String): ImageUploadResult {
        // 1. Check if recipe exists
        val recipe = recipeRepository.getRecipeById(recipeId)
            ?: return ImageUploadResult.RecipeNotFound(recipeId)

        // 2. Validate file size
        if (fileBytes.size > ImageUploadResult.MAX_FILE_SIZE) {
            return ImageUploadResult.FileTooLarge(fileBytes.size)
        }

        // 3. Validate format is WebP
        if (contentType != "image/webp") {
            return ImageUploadResult.InvalidFormat(actual = contentType)
        }

        // 4. Validate dimensions
        val image = try {
            ImageIO.read(ByteArrayInputStream(fileBytes))
        } catch (e: Exception) {
            logger.error("Failed to read image data", e)
            return ImageUploadResult.IOError("Failed to read image: ${e.message}")
        }

        if (image == null) {
            return ImageUploadResult.InvalidImageData
        }

        if (image.width != ImageUploadResult.EXPECTED_WIDTH || image.height != ImageUploadResult.EXPECTED_HEIGHT) {
            return ImageUploadResult.InvalidDimensions(
                actualWidth = image.width,
                actualHeight = image.height
            )
        }

        // 5. Save file to disk
        val fileName = "$recipeId.webp"
        val recipeImagesDir = File(imageStoragePath, "recipes")

        try {
            if (!recipeImagesDir.exists()) {
                throw IllegalStateException("Recipe images directory does not exist: ${recipeImagesDir.absolutePath}")
            }

            val file = File(recipeImagesDir, fileName)
            file.writeBytes(fileBytes)
            logger.info("Saved image for recipe $recipeId: ${file.absolutePath} (${fileBytes.size} bytes)")
        } catch (e: Exception) {
            logger.error("Failed to save image file", e)
            return ImageUploadResult.IOError("Failed to save image: ${e.message}")
        }

        // 6. Update recipe's imageUrl in database
        val imageUrl = "/images/recipes/$fileName"
        try {
            val updatedRecipe = recipe.copy(
                imageUrl = imageUrl,
                lastUpdatedAtInMillis = System.currentTimeMillis()
            )
            recipeRepository.updateRecipe(recipeId, updatedRecipe)
            logger.info("Updated recipe $recipeId with image URL: $imageUrl")
        } catch (e: Exception) {
            logger.error("Failed to update recipe in database", e)
            return ImageUploadResult.IOError("Failed to update recipe: ${e.message}")
        }

        return ImageUploadResult.Success(imageUrl)
    }
}
