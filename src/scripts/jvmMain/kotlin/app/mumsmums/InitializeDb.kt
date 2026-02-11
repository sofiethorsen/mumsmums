package app.mumsmums

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.IngredientTable
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.UnitTable
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.json.JsonParser
import app.mumsmums.logging.getLoggerByPackage
import app.mumsmums.model.LibraryIngredient
import kotlin.io.path.Path
import kotlin.io.path.exists
import kotlin.system.exitProcess

private val logger = getLoggerByPackage()

/**
 * Sort ingredients so that parent ingredients (those referenced by derivesFromId) come before their children.
 */
private fun sortIngredientsByDependency(ingredients: List<LibraryIngredient>): List<LibraryIngredient> {
    val byId = ingredients.associateBy { it.id }
    val inserted = mutableSetOf<Long>()
    val result = mutableListOf<LibraryIngredient>()

    fun insert(ingredient: LibraryIngredient) {
        if (ingredient.id in inserted) return

        // If this ingredient derives from another, insert the parent first
        ingredient.derivesFromId?.let { parentId ->
            byId[parentId]?.let { parent ->
                insert(parent)
            }
        }

        result.add(ingredient)
        inserted.add(ingredient.id)
    }

    ingredients.forEach { insert(it) }
    return result
}

/**
 * Script to initialize/regenerate the SQLite database from recipes.json
 * This will completely overwrite the existing database.
 *
 * Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:initalize
 */
fun main() {
    logger.info("=== Initializing Recipe Database ===")

    try {
        // Initialize database connection
        val database = DatabaseConnection()
        val numericIdGenerator = NumericIdGenerator()

        logger.info("Deleting existing tables and recreating them...")
        database.dropTables()
        database.createTablesIfNotExists()

        // Import ingredient library if file exists
        val ingredientsPath = Path(MumsMumsPaths.getIngredientsJsonPath())
        if (ingredientsPath.exists()) {
            logger.info("Reading ingredients from JSON...")
            val ingredients = JsonParser.parseIngredients(ingredientsPath)
            logger.info("Found {} ingredients", ingredients.size)

            // Sort so parent ingredients are inserted before their children
            val sortedIngredients = sortIngredientsByDependency(ingredients)

            val ingredientTable = IngredientTable(database, numericIdGenerator)
            sortedIngredients.forEach { ingredient ->
                ingredientTable.insertWithId(ingredient)
            }
            logger.info("Imported {} ingredients", sortedIngredients.size)
        } else {
            logger.info("No ingredients.json found, skipping ingredient library import")
        }

        // Import unit library if file exists
        val unitsPath = Path(MumsMumsPaths.getUnitsJsonPath())
        if (unitsPath.exists()) {
            logger.info("Reading units from JSON...")
            val units = JsonParser.parseUnits(unitsPath)
            logger.info("Found {} units", units.size)

            val unitTable = UnitTable(database, numericIdGenerator)
            units.forEach { unit ->
                unitTable.insertWithId(unit)
            }
            logger.info("Imported {} units", units.size)
        } else {
            logger.info("No units.json found, skipping unit library import")
        }

        // Parse and import recipes
        logger.info("Reading recipes from JSON...")
        val recipes = JsonParser.parseRecipes(Path(MumsMumsPaths.getRecipesJsonPath()))
        logger.info("Found {} recipes", recipes.size)

        val recipesTable = RecipesTable(database, numericIdGenerator)
        recipesTable.batchPut(recipes)

        logger.info("=== Database initialization complete! ===")
        logger.info("Total recipes in database: {}", recipes.size)
    } catch (exception: Exception) {
        logger.error("Failed to initialize database", exception)
        exitProcess(1)
    }
}
