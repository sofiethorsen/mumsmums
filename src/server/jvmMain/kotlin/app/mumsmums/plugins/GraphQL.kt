package app.mumsmums.plugins

import app.mumsmums.model.Recipe
import com.apurebase.kgraphql.GraphQL
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate

private val recipes = listOf(
        Recipe("mums"),
        Recipe("kärleksmums")
)

fun Application.configureGraphQL() {
    install(GraphQL) {
        playground = true
        schema {
            type<Recipe>() {
                description = "Recipe object"
            }
            query("recipes") {
                resolver { -> recipes }
            }
        }
    }
}
