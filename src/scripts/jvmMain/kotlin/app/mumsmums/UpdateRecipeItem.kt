package app.mumsmums

import app.mumsmums.db.SqliteRecipesDatabase
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        println("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:update -- <recipeId>")
        println("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:update -- 123456")
        exitProcess(1)
    }

    val recipeId = args[0].toLongOrNull() ?: run {
        println("Error: Invalid recipe ID. Must be a number.")
        exitProcess(1)
    }

    val db = SqliteRecipesDatabase()

    println("Fetching recipe with ID: $recipeId")
    db.get(recipeId)?.let { original ->
        println("\n=== Original Recipe ===")
        println("Name: ${original.name}")
        println("Current imageUrl: ${original.imageUrl}")
        println("Current fbPreviewImageUrl: ${original.fbPreviewImageUrl}")

        // Example: Update image URLs
        // Modify this section to update the fields you need
        val updated = original.copy(
            fbPreviewImageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/$recipeId/1200-600.webp",
            imageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/$recipeId/300-300.webp",
        )

        println("\n=== Updating Recipe ===")
        println("New imageUrl: ${updated.imageUrl}")
        println("New fbPreviewImageUrl: ${updated.fbPreviewImageUrl}")

        db.update(recipeId, updated)

        println("\n=== Recipe Updated Successfully ===")
    } ?: run {
        println("Recipe with ID $recipeId not found")
        exitProcess(1)
    }
}
