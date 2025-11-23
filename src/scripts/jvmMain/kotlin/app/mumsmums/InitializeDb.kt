package app.mumsmums

import app.mumsmums.db.RecipesDatabase
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
    val recipesJsonPath = "${projectRoot.absolutePath}/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipes.json"

    println("Database path: $dbPath")
    println("Recipes JSON path: $recipesJsonPath")
    println()

    try {
        // Parse recipes from JSON
        println("Reading recipes from JSON...")
        val recipes = JsonParser.parseRecipes(Path(recipesJsonPath))
        println("Found ${recipes.size} recipes")
        println()

        // Initialize database connection
        val db = RecipesDatabase(dbPath)

        println("Deleting existing tables and recreating them...")
        db.dropTables()
        db.createTablesIfNotExists()

        db.batchPut(recipes)

        println()
        println("=== Database initialization complete! ===")
        println("Total recipes in database: ${recipes.size}")
    } catch (exception: Exception) {
        println("Failed to initialize database, stacktrace: ${exception.printStackTrace()}")
        exitProcess(1)
    }
}
