package app.mumsmums

import app.mumsmums.db.SqliteRecipesDatabase
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        println("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:get -- <recipeId>")
        println("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:get -- 123456")
        exitProcess(1)
    }

    val recipeId = args[0].toLongOrNull() ?: run {
        println("Error: Invalid recipe ID. Must be a number.")
        exitProcess(1)
    }

    // Find project root
    val projectRoot = run {
        val currentDir = java.io.File(".").absoluteFile
        var root = currentDir
        while (root != null && !java.io.File(root, "MODULE.bazel").exists()) {
            root = root.parentFile
        }
        root ?: currentDir
    }

    val dbPath = "${projectRoot.absolutePath}/sqlite/recipes.db"
    val table = SqliteRecipesDatabase(dbPath)

    println("Fetching recipe with ID: $recipeId")
    val recipe = table.get(recipeId)

    if (recipe != null) {
        println("\n=== Recipe Found ===")
        println("ID: ${recipe.recipeId}")
        println("Name: ${recipe.name}")
        println("Description: ${recipe.description}")
        println("Servings: ${recipe.servings}")
        println("Number of Units: ${recipe.numberOfUnits}")
        println("Image URL: ${recipe.imageUrl}")
        println("FB Preview Image URL: ${recipe.fbPreviewImageUrl}")
        println("Version: ${recipe.version}")
        println("Created At: ${recipe.createdAtInMillis}")
        println("Last Updated At: ${recipe.lastUpdatedAtInMillis}")

        println("\n=== Ingredient Sections ===")
        recipe.ingredientSections.forEach { section ->
            println("\nSection: ${section.name ?: "Unnamed"}")
            section.ingredients.forEach { ingredient ->
                val quantityStr = ingredient.quantity?.toString() ?: ""
                val volumeStr = ingredient.volume ?: ""
                println("  - $quantityStr $volumeStr ${ingredient.name}".trim())
            }
        }

        println("\n=== Steps ===")
        recipe.steps.forEachIndexed { index, step ->
            println("${index + 1}. $step")
        }
    } else {
        println("Recipe with ID $recipeId not found")
        exitProcess(1)
    }
}
