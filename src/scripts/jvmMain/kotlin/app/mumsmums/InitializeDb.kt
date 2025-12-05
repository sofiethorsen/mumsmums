package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipesTable
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.json.JsonParser
import app.mumsmums.logging.getLoggerByPackage
import kotlin.io.path.Path
import kotlin.system.exitProcess

private val logger = getLoggerByPackage()

/**
 * Script to initialize/regenerate the SQLite database from recipes.json
 * This will completely overwrite the existing database.
 *
 * Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:initalize
 */
fun main() {
    logger.info("=== Initializing Recipe Database ===")

    try {
        // Parse recipes from JSON
        logger.info("Reading recipes from JSON...")
        val recipes = JsonParser.parseRecipes(Path(MumsMumsPaths.getRecipesJsonPath()))
        logger.info("Found {} recipes", recipes.size)

        // Initialize database connection
        val database = DatabaseConnection()
        val numericIdGenerator = NumericIdGenerator()
        val recipesTable = RecipesTable(database, numericIdGenerator)

        logger.info("Deleting existing tables and recreating them...")
        database.dropTables()
        database.createTablesIfNotExists()

        recipesTable.batchPut(recipes)

        logger.info("=== Database initialization complete! ===")
        logger.info("Total recipes in database: {}", recipes.size)
    } catch (exception: Exception) {
        logger.error("Failed to initialize database", exception)
        exitProcess(1)
    }
}
