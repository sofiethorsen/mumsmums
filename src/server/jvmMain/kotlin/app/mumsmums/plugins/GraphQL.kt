package app.mumsmums.plugins

import app.mumsmums.data.recipes
import app.mumsmums.model.Recipe
import com.apurebase.kgraphql.GraphQL
import io.ktor.server.application.Application
import io.ktor.server.application.install

private fun getRecipeById(id: Int): Recipe? {
    return recipes.find { it.id == id }
}

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
            query("recipe") {
                resolver { id: Int -> getRecipeById(id) }
            }
        }
    }
}
