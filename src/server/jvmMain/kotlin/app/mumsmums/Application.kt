package app.mumsmums

import app.mumsmums.auth.AuthHandler
import app.mumsmums.auth.JwtConfig
import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.UsersTable
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.json.JsonParser
import app.mumsmums.logging.getLoggerByPackage
import app.mumsmums.plugins.configureAuth
import app.mumsmums.plugins.configureAuthRoutes
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import app.mumsmums.plugins.configureHeaders
import app.mumsmums.plugins.configureSerialization
import app.mumsmums.time.SystemTimeProvider
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import kotlin.io.path.Path

private val logger = getLoggerByPackage()

private const val JWT_SECRET_ENV_VAR = "JWT_SECRET"
private const val SECURE_COOKIES_ENV_VAR = "SECURE_COOKIES"

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    // Required env vars
    // SECURE_COOKIES - is only ever set to false in local development; on the deployed host it's set to true through
    // the .env file.
    val secureCookies = System.getenv(SECURE_COOKIES_ENV_VAR)?.toBoolean()
        ?: throw IllegalStateException("$SECURE_COOKIES_ENV_VAR environment variable is required")
    val jwtSecret = System.getenv(JWT_SECRET_ENV_VAR) ?: throw IllegalStateException("$JWT_SECRET_ENV_VAR environment variable is required")

    val connection = DatabaseConnection()
    val idGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(connection, idGenerator)
    val usersTable = UsersTable(connection, SystemTimeProvider)

    // JWT setup
    val secret = JwtConfig.Secret(jwtSecret)
    val issuer = JwtConfig.Issuer("mumsmums")
    val audience = JwtConfig.Audience("mumsmums-admins")
    val jwtConfig = JwtConfig(secret, issuer, audience)

    // Auth handler
    val authHandler = AuthHandler(usersTable)

    // Initialize database from recipes.json if empty
    initializeDatabaseIfEmpty(recipesTable)

    val recipeRepository = RecipeRepository(recipesTable)

    configureSerialization()
    configureAuth(jwtConfig)
    configureAuthRoutes(authHandler, jwtConfig, secureCookies)
    configureGraphQL(recipeRepository)
    configureCORS()
    configureHeaders()

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
