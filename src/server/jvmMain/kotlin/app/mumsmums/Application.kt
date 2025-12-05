package app.mumsmums

import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    val connection = DatabaseConnection()
    val idGenerator = NumericIdGenerator()
    val recipesTable = RecipesTable(connection, idGenerator)
    val recipeRepository = RecipeRepository(recipesTable)

    configureGraphQL(recipeRepository)
    configureCORS()

    println("Server started on http://localhost:8080")
}
