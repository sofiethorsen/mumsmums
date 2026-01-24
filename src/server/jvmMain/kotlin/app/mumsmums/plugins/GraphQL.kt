package app.mumsmums.plugins

import app.mumsmums.auth.JwtConfig
import app.mumsmums.db.RecipeRepository
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import com.apurebase.kgraphql.Context
import com.apurebase.kgraphql.GraphQL
import com.auth0.jwt.exceptions.JWTVerificationException
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal

class UnauthorizedException : Exception("Authentication required")

private fun Context.requireAuth(jwtConfig: JwtConfig) {
    val call = get<ApplicationCall>()

    // First try to get principal (works for /api/auth/status endpoint)
    val principal = call?.principal<JWTPrincipal>()
    if (principal != null) {
        return
    }

    // For GraphQL endpoint, manually verify JWT from cookie
    val cookieValue = call?.request?.cookies?.get(AUTH_COOKIE_NAME) ?: throw UnauthorizedException()

    try {
        jwtConfig.verifier.verify(cookieValue)
    } catch (e: JWTVerificationException) {
        throw UnauthorizedException()
    }
}

data class IngredientInput(
    val name: String,
    val volume: String? = null,
    val quantity: Float? = null,
    val recipeId: Long? = null
)

data class IngredientSectionInput(
    val name: String?,
    val ingredients: List<IngredientInput>
)

data class RecipeInput(
    val name: String,
    val ingredientSections: List<IngredientSectionInput>,
    val steps: List<String>,
    val description: String? = null,
    val servings: Int? = null,
    val numberOfUnits: Int? = null,
    val imageUrl: String? = null,
)

fun Application.configureGraphQL(recipeRepository: RecipeRepository, jwtConfig: JwtConfig) {
    install(GraphQL) {
        // Provide ApplicationCall in the context for each request
        context { call ->
            +call
        }
        schema {
            type<Recipe>() {
                description = "Recipe object"
            }

            inputType<IngredientInput>() {
                description = "Input for an ingredient"
            }

            inputType<IngredientSectionInput>() {
                description = "Input for an ingredient section"
            }

            inputType<RecipeInput>() {
                description = "Input for creating or updating a recipe"
            }

            query("recipes") {
                resolver { -> recipeRepository.getAllRecipes() }
            }
            query("recipe") {
                resolver { recipeId: Long -> recipeRepository.getRecipeById(recipeId) }
            }

            mutation("createRecipe") {
                resolver { ctx: Context, input: RecipeInput ->
                    ctx.requireAuth(jwtConfig)
                    val recipeId = recipeRepository.createRecipeId()
                    val currentTime = System.currentTimeMillis()

                    val recipe = Recipe(
                        recipeId = recipeId,
                        name = input.name,
                        ingredientSections = input.ingredientSections.map { section ->
                            IngredientSection(
                                name = section.name,
                                ingredients = section.ingredients.map { ing ->
                                    Ingredient(
                                        name = ing.name,
                                        volume = ing.volume,
                                        quantity = ing.quantity,
                                        recipeId = ing.recipeId
                                    )
                                }
                            )
                        },
                        steps = input.steps,
                        description = input.description,
                        servings = input.servings,
                        numberOfUnits = input.numberOfUnits,
                        imageUrl = input.imageUrl,
                        version = 1L,
                        createdAtInMillis = currentTime,
                        lastUpdatedAtInMillis = currentTime
                    )

                    recipeRepository.createRecipe(recipe)
                    recipe
                }
            }

            mutation("updateRecipe") {
                resolver { ctx: Context, recipeId: Long, input: RecipeInput ->
                    ctx.requireAuth(jwtConfig)
                    val existingRecipe = recipeRepository.getRecipeById(recipeId)
                        ?: throw IllegalArgumentException("Recipe with ID $recipeId not found")

                    val updatedRecipe = Recipe(
                        recipeId = recipeId,
                        name = input.name,
                        ingredientSections = input.ingredientSections.map { section ->
                            IngredientSection(
                                name = section.name,
                                ingredients = section.ingredients.map { ing ->
                                    Ingredient(
                                        name = ing.name,
                                        volume = ing.volume,
                                        quantity = ing.quantity,
                                        recipeId = ing.recipeId
                                    )
                                }
                            )
                        },
                        steps = input.steps,
                        description = input.description,
                        servings = input.servings,
                        numberOfUnits = input.numberOfUnits,
                        imageUrl = input.imageUrl,
                        version = existingRecipe.version + 1,
                        createdAtInMillis = existingRecipe.createdAtInMillis,
                        lastUpdatedAtInMillis = System.currentTimeMillis()
                    )

                    recipeRepository.updateRecipe(recipeId, updatedRecipe)
                    updatedRecipe
                }
            }

            mutation("deleteRecipe") {
                resolver { ctx: Context, recipeId: Long ->
                    ctx.requireAuth(jwtConfig)
                    val recipe = recipeRepository.getRecipeById(recipeId)
                        ?: throw IllegalArgumentException("Recipe with ID $recipeId not found")

                    recipeRepository.deleteRecipe(recipeId)
                    true
                }
            }
        }
    }
}
