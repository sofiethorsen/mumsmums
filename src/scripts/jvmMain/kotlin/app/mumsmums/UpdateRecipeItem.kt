package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipesTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByPackage
import kotlin.system.exitProcess

private val logger = getLoggerByPackage()

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        logger.info("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:update -- <recipeId>")
        logger.info("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:update -- 123456")
        exitProcess(1)
    }

    val recipeId = args[0].toLongOrNull() ?: run {
        logger.error("Invalid recipe ID. Must be a number.")
        exitProcess(1)
    }

    val database = DatabaseConnection()
    val numericIdGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(database, numericIdGenerator)

    logger.info("Fetching recipe with ID: $recipeId")
    recipesTable.get(recipeId)?.let { original ->
        logger.info("\n=== Original Recipe ===")
        logger.info("Name: ${original.name}")
        logger.info("Current imageUrl: ${original.imageUrl}")
        logger.info("Current fbPreviewImageUrl: ${original.fbPreviewImageUrl}")

        // Example: Update image URLs
        // Modify this section to update the fields you need
        val updated = original.copy(
            fbPreviewImageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/$recipeId/1200-600.webp",
            imageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/$recipeId/300-300.webp",
        )

        logger.info("\n=== Updating Recipe ===")
        logger.info("New imageUrl: ${updated.imageUrl}")
        logger.info("New fbPreviewImageUrl: ${updated.fbPreviewImageUrl}")

        recipesTable.update(recipeId, updated)

        logger.info("\n=== Recipe Updated Successfully ===")
    } ?: run {
        logger.info("Recipe with ID $recipeId not found")
        exitProcess(1)
    }
}
