package app.mumsmums.plugins

import app.mumsmums.auth.JwtConfig
import app.mumsmums.db.CategoryTable
import app.mumsmums.db.IngredientTable
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.UnitTable
import app.mumsmums.model.Category
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.LibraryIngredient
import app.mumsmums.model.LibraryUnit
import app.mumsmums.model.NewRecipe
import app.mumsmums.model.Recipe
import app.mumsmums.model.RecipeReference
import app.mumsmums.model.UnitType
import app.mumsmums.revalidation.RevalidationClient
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

private fun Context.getJwtToken(): String {
    val call = get<ApplicationCall>()
    return call?.request?.cookies?.get(AUTH_COOKIE_NAME) ?: throw UnauthorizedException()
}

data class IngredientInput(
    val name: String,
    val volume: String? = null,
    val quantity: Float? = null,
    val recipeId: Long? = null,
    val ingredientId: Long? = null,
    val unitId: Long? = null
)

data class IngredientSectionInput(
    val nameSv: String?,
    val nameEn: String? = null,
    val ingredients: List<IngredientInput>
)

data class RecipeInput(
    val nameSv: String,
    val ingredientSections: List<IngredientSectionInput>,
    val stepsSv: List<String>,
    val nameEn: String? = null,
    val stepsEn: List<String> = emptyList(),
    val descriptionSv: String? = null,
    val descriptionEn: String? = null,
    val servings: Int? = null,
    val numberOfUnits: Int? = null,
    val imageUrl: String? = null,
)

// Ingredient library input
data class LibraryIngredientInput(
    val nameSv: String,
    val nameEn: String? = null,
    val qualifierSv: String? = null,
    val qualifierEn: String? = null,
    val derivesFromId: Long? = null,
    val fullNameSv: String,
    val fullNameEn: String? = null
)

data class LibraryUnitInput(
    val shortNameSv: String,
    val shortNameEn: String? = null,
    val nameSv: String,
    val nameEn: String? = null,
    val type: UnitType,
    val mlEquivalent: Float? = null,
    val gEquivalent: Float? = null
)

data class CategoryInput(
    val nameSv: String,
    val nameEn: String,
)

fun Application.configureGraphQL(
    recipesTable: RecipesTable,
    jwtConfig: JwtConfig,
    revalidationClient: RevalidationClient,
    ingredientTable: IngredientTable,
    unitTable: UnitTable,
    categoryTable: CategoryTable
) {
    install(GraphQL) {
        // Provide ApplicationCall in the context for each request
        context { call ->
            +call
        }
        schema {
            type<Recipe>() {
                description = "Recipe object"
                property<List<RecipeReference>>("usedIn") {
                    description = "Recipes that use this recipe as an ingredient"
                    resolver { recipe: Recipe ->
                        recipesTable.getRecipesUsingAsIngredient(recipe.recipeId)
                    }
                }
                property<List<Long>>("ingredientIds") {
                    description = "Flat list of unique library ingredient IDs used in this recipe"
                    resolver { recipe: Recipe ->
                        recipe.ingredientSections
                            .flatMap { it.ingredients }
                            .mapNotNull { it.ingredientId }
                            .distinct()
                    }
                }
                property<List<Category>>("categories") {
                    description = "Categories assigned to this recipe"
                    resolver { recipe: Recipe ->
                        categoryTable.getCategoriesForRecipe(recipe.recipeId)
                    }
                }
            }

            type<RecipeReference>() {
                description = "A lightweight reference to a recipe"
            }

            type<Ingredient>() {
                description = "An ingredient in a recipe"
                property<String?>("nameEn") {
                    description = "English name resolved from ingredient library"
                    resolver { ingredient: Ingredient ->
                        ingredient.ingredientId?.let { ingredientTable.getById(it)?.fullNameEn }
                    }
                }
                property<String?>("volumeEn") {
                    description = "English unit abbreviation resolved from unit library"
                    resolver { ingredient: Ingredient ->
                        ingredient.unitId?.let { unitTable.getById(it)?.shortNameEn }
                    }
                }
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

            // Library types
            type<LibraryIngredient>() {
                description = "Ingredient from the ingredient library"
            }

            type<LibraryUnit>() {
                description = "Unit from the unit library"
            }

            enum<UnitType>() {
                description = "Type of unit (VOLUME, WEIGHT, COUNT, OTHER)"
            }

            inputType<LibraryIngredientInput>() {
                description = "Input for creating or updating a library ingredient"
            }

            inputType<LibraryUnitInput>() {
                description = "Input for creating or updating a library unit"
            }

            type<Category>() {
                description = "Recipe category"
            }

            inputType<CategoryInput>() {
                description = "Input for creating or updating a category"
            }

            query("recipes") {
                resolver { -> recipesTable.scan() }
            }
            query("recipe") {
                resolver { recipeId: Long -> recipesTable.get(recipeId) }
            }

            // Ingredient queries
            query("ingredients") {
                resolver { -> ingredientTable.getAll() }
            }
            query("ingredient") {
                resolver { id: Long -> ingredientTable.getById(id) }
            }
            query("searchIngredients") {
                resolver { query: String -> ingredientTable.search(query) }
            }

            // Unit queries
            query("units") {
                resolver { -> unitTable.getAll() }
            }
            query("unit") {
                resolver { id: Long -> unitTable.getById(id) }
            }

            // Category queries
            query("categories") {
                resolver { -> categoryTable.getAll() }
            }
            query("category") {
                resolver { id: Long -> categoryTable.getById(id) }
            }

            mutation("createRecipe") {
                resolver { ctx: Context, input: RecipeInput ->
                    ctx.requireAuth(jwtConfig)
                    val currentTime = System.currentTimeMillis()

                    val newRecipe = NewRecipe(
                        nameSv = input.nameSv,
                        nameEn = input.nameEn,
                        ingredientSections = input.ingredientSections.map { section ->
                            IngredientSection(
                                nameSv = section.nameSv,
                                nameEn = section.nameEn,
                                ingredients = section.ingredients.map { ing ->
                                    Ingredient(
                                        name = ing.name,
                                        volume = ing.volume,
                                        quantity = ing.quantity,
                                        recipeId = ing.recipeId,
                                        ingredientId = ing.ingredientId,
                                        unitId = ing.unitId
                                    )
                                }
                            )
                        },
                        stepsSv = input.stepsSv,
                        stepsEn = input.stepsEn,
                        descriptionSv = input.descriptionSv,
                        descriptionEn = input.descriptionEn,
                        servings = input.servings,
                        numberOfUnits = input.numberOfUnits,
                        imageUrl = input.imageUrl,
                        version = 1L,
                        createdAtInMillis = currentTime,
                        lastUpdatedAtInMillis = currentTime
                    )

                    val recipe = recipesTable.insert(newRecipe)

                    // Trigger revalidation of homepage and new recipe page
                    val jwtToken = ctx.getJwtToken()
                    revalidationClient.revalidateRecipe(recipe.recipeId, jwtToken)

                    recipe
                }
            }

            mutation("updateRecipe") {
                resolver { ctx: Context, recipeId: Long, input: RecipeInput ->
                    ctx.requireAuth(jwtConfig)
                    val existingRecipe = recipesTable.get(recipeId)
                        ?: throw IllegalArgumentException("Recipe with ID $recipeId not found")

                    val updatedRecipe = Recipe(
                        recipeId = recipeId,
                        nameSv = input.nameSv,
                        nameEn = input.nameEn,
                        ingredientSections = input.ingredientSections.map { section ->
                            IngredientSection(
                                nameSv = section.nameSv,
                                nameEn = section.nameEn,
                                ingredients = section.ingredients.map { ing ->
                                    Ingredient(
                                        name = ing.name,
                                        volume = ing.volume,
                                        quantity = ing.quantity,
                                        recipeId = ing.recipeId,
                                        ingredientId = ing.ingredientId,
                                        unitId = ing.unitId
                                    )
                                }
                            )
                        },
                        stepsSv = input.stepsSv,
                        stepsEn = input.stepsEn,
                        descriptionSv = input.descriptionSv,
                        descriptionEn = input.descriptionEn,
                        servings = input.servings,
                        numberOfUnits = input.numberOfUnits,
                        imageUrl = input.imageUrl,
                        version = existingRecipe.version + 1,
                        createdAtInMillis = existingRecipe.createdAtInMillis,
                        lastUpdatedAtInMillis = System.currentTimeMillis()
                    )

                    recipesTable.update(recipeId, updatedRecipe)

                    // Trigger revalidation of homepage and updated recipe page
                    val jwtToken = ctx.getJwtToken()
                    revalidationClient.revalidateRecipe(recipeId, jwtToken)

                    updatedRecipe
                }
            }

            mutation("deleteRecipe") {
                resolver { ctx: Context, recipeId: Long ->
                    ctx.requireAuth(jwtConfig)
                    recipesTable.get(recipeId)
                        ?: throw IllegalArgumentException("Recipe with ID $recipeId not found")

                    recipesTable.delete(recipeId)

                    // Trigger revalidation of homepage (recipe page will 404)
                    val jwtToken = ctx.getJwtToken()
                    revalidationClient.revalidateHomepage(jwtToken)

                    true
                }
            }

            // Ingredient mutations
            mutation("createIngredient") {
                resolver { ctx: Context, input: LibraryIngredientInput ->
                    ctx.requireAuth(jwtConfig)
                    val id = ingredientTable.insert(
                        LibraryIngredient(
                            id = 0,
                            nameSv = input.nameSv,
                            nameEn = input.nameEn,
                            qualifierSv = input.qualifierSv,
                            qualifierEn = input.qualifierEn,
                            derivesFromId = input.derivesFromId,
                            fullNameSv = input.fullNameSv,
                            fullNameEn = input.fullNameEn
                        )
                    )
                    ingredientTable.getById(id)
                }
            }

            mutation("updateIngredient") {
                resolver { ctx: Context, id: Long, input: LibraryIngredientInput ->
                    ctx.requireAuth(jwtConfig)
                    ingredientTable.update(
                        LibraryIngredient(
                            id = id,
                            nameSv = input.nameSv,
                            nameEn = input.nameEn,
                            qualifierSv = input.qualifierSv,
                            qualifierEn = input.qualifierEn,
                            derivesFromId = input.derivesFromId,
                            fullNameSv = input.fullNameSv,
                            fullNameEn = input.fullNameEn
                        )
                    )
                    ingredientTable.getById(id)
                }
            }

            mutation("deleteIngredient") {
                resolver { ctx: Context, id: Long ->
                    ctx.requireAuth(jwtConfig)
                    ingredientTable.delete(id)
                    true
                }
            }

            // Unit mutations
            mutation("createUnit") {
                resolver { ctx: Context, input: LibraryUnitInput ->
                    ctx.requireAuth(jwtConfig)
                    val id = unitTable.insert(
                        LibraryUnit(
                            id = 0,
                            shortNameSv = input.shortNameSv,
                            shortNameEn = input.shortNameEn,
                            nameSv = input.nameSv,
                            nameEn = input.nameEn,
                            type = input.type,
                            mlEquivalent = input.mlEquivalent,
                            gEquivalent = input.gEquivalent
                        )
                    )
                    unitTable.getById(id)
                }
            }

            mutation("updateUnit") {
                resolver { ctx: Context, id: Long, input: LibraryUnitInput ->
                    ctx.requireAuth(jwtConfig)
                    unitTable.update(
                        LibraryUnit(
                            id = id,
                            shortNameSv = input.shortNameSv,
                            shortNameEn = input.shortNameEn,
                            nameSv = input.nameSv,
                            nameEn = input.nameEn,
                            type = input.type,
                            mlEquivalent = input.mlEquivalent,
                            gEquivalent = input.gEquivalent
                        )
                    )
                    unitTable.getById(id)
                }
            }

            mutation("deleteUnit") {
                resolver { ctx: Context, id: Long ->
                    ctx.requireAuth(jwtConfig)
                    unitTable.delete(id)
                    true
                }
            }

            // Category mutations
            mutation("createCategory") {
                resolver { ctx: Context, input: CategoryInput ->
                    ctx.requireAuth(jwtConfig)
                    val id = categoryTable.insert(
                        Category(id = 0, nameSv = input.nameSv, nameEn = input.nameEn)
                    )
                    categoryTable.getById(id)
                }
            }

            mutation("updateCategory") {
                resolver { ctx: Context, id: Long, input: CategoryInput ->
                    ctx.requireAuth(jwtConfig)
                    categoryTable.update(
                        Category(id = id, nameSv = input.nameSv, nameEn = input.nameEn)
                    )
                    categoryTable.getById(id)
                }
            }

            mutation("deleteCategory") {
                resolver { ctx: Context, id: Long ->
                    ctx.requireAuth(jwtConfig)
                    categoryTable.delete(id)
                    true
                }
            }

            mutation("setRecipeCategories") {
                resolver { ctx: Context, recipeId: Long, categoryIds: List<Long> ->
                    ctx.requireAuth(jwtConfig)
                    categoryTable.setCategoriesForRecipe(recipeId, categoryIds)
                    categoryTable.getCategoriesForRecipe(recipeId)
                }
            }
        }
    }
}
