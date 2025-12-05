package app.mumsmums

import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.json.JsonParser
import app.mumsmums.logging.getLoggerByPackage
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import kotlin.io.path.Path

private val logger = getLoggerByPackage()

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    val connection = DatabaseConnection()
    val idGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(connection, idGenerator)

    // Initialize database from recipes.json if empty
    initializeDatabaseIfEmpty(recipesTable)

    val recipeRepository = RecipeRepository(recipesTable)

    configureGraphQL(recipeRepository)
    configureCORS()

    logger.info("Server started on http://localhost:8080")
}

private fun initializeDatabaseIfEmpty(recipesTable: RecipesTable) {
    val existingRecipes = recipesTable.scan()
    if (existingRecipes.isEmpty()) {
        logger.info("Database is empty, initializing from recipes.json...")
        val recipes = JsonParser.parseRecipes(Path(MumsMumsPaths.getRecipesJsonPath()))
        recipesTable.batchPut(recipes)
        logger.info("Database initialized with {} recipes from recipes.json", recipes.size)
    } else {
        logger.info("Database already contains {} recipes, skipping initialization", existingRecipes.size)
    }
}
