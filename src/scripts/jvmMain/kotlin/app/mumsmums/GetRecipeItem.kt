package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipesTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByPackage
import kotlin.system.exitProcess

private val logger = getLoggerByPackage()

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        logger.info("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:get -- <recipeId>")
        logger.info("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:get -- 123456")
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
    val recipe = recipesTable.get(recipeId)

    if (recipe != null) {
        logger.info("\n=== Recipe Found ===")
        logger.info("ID: ${recipe.recipeId}")
        logger.info("Name: ${recipe.name}")
        logger.info("Description: ${recipe.description}")
        logger.info("Servings: ${recipe.servings}")
        logger.info("Number of Units: ${recipe.numberOfUnits}")
        logger.info("Image URL: ${recipe.imageUrl}")
        logger.info("Version: ${recipe.version}")
        logger.info("Created At: ${recipe.createdAtInMillis}")
        logger.info("Last Updated At: ${recipe.lastUpdatedAtInMillis}")

        logger.info("\n=== Ingredient Sections ===")
        recipe.ingredientSections.forEach { section ->
            logger.info("\nSection: ${section.name ?: "Unnamed"}")
            section.ingredients.forEach { ingredient ->
                val quantityStr = ingredient.quantity?.toString() ?: ""
                val volumeStr = ingredient.volume ?: ""
                logger.info("  - $quantityStr $volumeStr ${ingredient.name}".trim())
            }
        }

        logger.info("\n=== Steps ===")
        recipe.steps.forEachIndexed { index, step ->
            logger.info("${index + 1}. $step")
        }
    } else {
        logger.warn("Recipe with ID $recipeId not found")
        exitProcess(1)
    }
}
