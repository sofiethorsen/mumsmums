package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.RecipeTable
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import app.mumsmums.plugins.configureRouting
import app.mumsmums.plugins.configureSecurity
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    val amazonDynamoDB = DynamoClientFactory.getDynamoDb()
    val recipeTable = RecipeTable(amazonDynamoDB)
    val recipeRepository = RecipeRepository(recipeTable)

    configureSecurity()
    configureRouting()
    configureGraphQL(recipeRepository)
    configureCORS()
}
