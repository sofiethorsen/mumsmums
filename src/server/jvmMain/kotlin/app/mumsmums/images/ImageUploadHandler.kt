package app.mumsmums.images

import app.mumsmums.db.RecipeRepository
import app.mumsmums.logging.getLoggerByClass
import app.mumsmums.revalidation.RevalidationClient
import java.io.File

sealed class ImageUploadResult {
    data class Success(val imageUrl: String) : ImageUploadResult()
    data class RecipeNotFound(val recipeId: Long) : ImageUploadResult()
    data class FileTooLarge(val actualSize: Int, val maxSize: Int = MAX_FILE_SIZE) : ImageUploadResult()
    data class InvalidFormat(val expected: String = "image/webp", val actual: String) : ImageUploadResult()
    data class IOError(val message: String) : ImageUploadResult()

    companion object {
        const val MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    }
}

private val logger = getLoggerByClass<ImageUploadHandler>()

class ImageUploadHandler(
    private val recipeRepository: RecipeRepository,
    private val imageStoragePath: String,
    private val revalidationClient: RevalidationClient? = null
) {
    /**
     * Upload and validate an image for a recipe.
     *
     * This method:
     * 1. Validates the recipe exists
     * 2. Validates file size
     * 3. Validates image format (WebP content type)
     * 4. Saves the image to disk
     * 5. Updates the recipe's imageUrl in the database
     * 6. Triggers revalidation of the recipe page (if client provided)
     *
     * Note: Dimension and image data validation are skipped as the client-side code
     * guarantees valid 1200x600 WebP images.
     *
     * @param recipeId The ID of the recipe to attach the image to
     * @param fileBytes The raw image file bytes
     * @param contentType The MIME type of the uploaded file (e.g., "image/webp")
     * @param jwtToken Optional JWT token for triggering revalidation
     * @return ImageUploadResult indicating success or specific failure reason
     */
    suspend fun uploadImage(recipeId: Long, fileBytes: ByteArray, contentType: String, jwtToken: String? = null): ImageUploadResult {
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

        // 4. Save file to disk
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

        // 5. Update recipe's imageUrl in database
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

        // 6. Trigger revalidation of homepage and recipe page
        if (revalidationClient != null && jwtToken != null) {
            try {
                revalidationClient.revalidateRecipe(recipeId, jwtToken)
                logger.info("Triggered revalidation for recipe $recipeId")
            } catch (e: Exception) {
                logger.error("Failed to trigger revalidation for recipe $recipeId", e)
                // Don't fail the upload if revalidation fails
            }
        }

        return ImageUploadResult.Success(imageUrl)
    }
}
