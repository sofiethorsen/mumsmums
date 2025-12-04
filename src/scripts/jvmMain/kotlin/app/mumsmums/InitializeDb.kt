package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipesTable
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import kotlin.io.path.Path
import kotlin.system.exitProcess

/**
 * Script to initialize/regenerate the SQLite database from recipes.json
 * This will completely overwrite the existing database.
 *
 * Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:initalize
 */
fun main() {
    println("=== Initializing Recipe Database ===")
    println()

    try {
        // Parse recipes from JSON
        println("Reading recipes from JSON...")
        val recipes = JsonParser.parseRecipes(Path(MumsMumsPaths.getRecipesJsonPath()))
        println("Found ${recipes.size} recipes")
        println()

        // Initialize database connection
        val database = DatabaseConnection()
        val numericIdGenerator = NumericIdGenerator()
        val recipesTable = RecipesTable(database, numericIdGenerator)

        println("Deleting existing tables and recreating them...")
        database.dropTables()
        database.createTablesIfNotExists()

        recipesTable.batchPut(recipes)

        println()
        println("=== Database initialization complete! ===")
        println("Total recipes in database: ${recipes.size}")
    } catch (exception: Exception) {
        println("Failed to initialize database, stacktrace: ${exception.printStackTrace()}")
        exitProcess(1)
    }
}
