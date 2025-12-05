package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipesTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByPackage
import kotlin.system.exitProcess

private val logger = getLoggerByPackage()

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        logger.info("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:delete -- <recipeId>")
        logger.info("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:delete -- 123456")
        exitProcess(1)
    }

    val recipeId = args[0].toLongOrNull() ?: run {
        logger.error("Invalid recipe ID. Must be a number.")
        exitProcess(1)
    }

    val database = DatabaseConnection()
    val numericIdGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(database, numericIdGenerator)

    logger.info("Deleting recipe with ID: $recipeId")
    recipesTable.delete(recipeId)

    logger.info("Done!")
}
