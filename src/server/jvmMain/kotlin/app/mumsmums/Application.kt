package app.mumsmums

import app.mumsmums.auth.AuthHandler
import app.mumsmums.auth.JwtConfig
import app.mumsmums.db.Database
import app.mumsmums.db.IngredientTable
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.UnitTable
import app.mumsmums.db.UsersTable
import app.mumsmums.filesystem.MumsMumsPaths
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.images.ImageUploadHandler
import app.mumsmums.logging.getLoggerByPackage
import app.mumsmums.plugins.configureAuth
import app.mumsmums.plugins.configureAuthRoutes
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import app.mumsmums.plugins.configureHeaders
import app.mumsmums.plugins.configureImageUpload
import app.mumsmums.plugins.configureSerialization
import app.mumsmums.plugins.configureStaticFiles
import app.mumsmums.revalidation.RevalidationClient
import app.mumsmums.time.SystemTimeProvider
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

private val logger = getLoggerByPackage()

private const val JWT_SECRET_ENV_VAR = "JWT_SECRET"
private const val SECURE_COOKIES_ENV_VAR = "SECURE_COOKIES"
private const val FRONTEND_URL_ENV_VAR = "FRONTEND_URL"

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

    val database = Database()
    val idGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(database, idGenerator, MumsMumsPaths.getImagePath())
    val usersTable = UsersTable(database, SystemTimeProvider)
    val ingredientTable = IngredientTable(database, idGenerator)
    val unitTable = UnitTable(database, idGenerator)

    // JWT setup
    val secret = JwtConfig.Secret(jwtSecret)
    val issuer = JwtConfig.Issuer("mumsmums")
    val audience = JwtConfig.Audience("mumsmums-admins")
    val jwtConfig = JwtConfig(secret, issuer, audience)

    // Auth handler
    val authHandler = AuthHandler(usersTable)

    val frontendUrl = System.getenv(FRONTEND_URL_ENV_VAR) ?: "http://localhost:3000"
    val revalidationClient = RevalidationClient(frontendUrl)

    // Image upload handler
    val uploadHandler = ImageUploadHandler(recipesTable, MumsMumsPaths.getImagePath(), revalidationClient)

    configureSerialization()
    configureAuth(jwtConfig)
    configureAuthRoutes(authHandler, jwtConfig, secureCookies)
    configureGraphQL(
        recipesTable,
        jwtConfig,
        revalidationClient,
        ingredientTable,
        unitTable
    )
    configureImageUpload(uploadHandler)
    configureCORS()
    configureHeaders()
    configureStaticFiles()

    logger.info("Server started on http://localhost:8080")
}
