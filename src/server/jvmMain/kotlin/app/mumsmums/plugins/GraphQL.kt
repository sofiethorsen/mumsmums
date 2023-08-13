package app.mumsmums.plugins

import app.mumsmums.db.RecipeRepository
import app.mumsmums.model.Recipe
import com.apurebase.kgraphql.GraphQL
import io.ktor.server.application.Application
import io.ktor.server.application.install

fun Application.configureGraphQL(recipeRepository: RecipeRepository) {
    install(GraphQL) {
        playground = true
        schema {
            type<Recipe>() {
                description = "Recipe object"
            }
            query("recipes") {
                resolver { -> recipeRepository.getAllRecipes() }
            }
            query("recipe") {
                resolver { recipeId: Long -> recipeRepository.getRecipeById(recipeId) }
            }
        }
    }
}
