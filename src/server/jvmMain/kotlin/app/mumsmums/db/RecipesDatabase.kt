package app.mumsmums.db

import app.mumsmums.model.Recipe
import app.mumsmums.model.RecipeReference

/**
 * Interface for database operations on recipes.
 */
interface RecipesDatabase {
    /**
     * Insert a new recipe into the database.
     */
    suspend fun put(recipe: Recipe)

    /**
     * Insert a list of recipes into the database in batch.
     */
    suspend fun batchPut(recipes: List<Recipe>)

    /**
     * Get a recipe by its ID.
     * @return The recipe if found, null otherwise.
     */
    suspend fun get(recipeId: Long): Recipe?

    /**
     * Get all recipes from the database.
     * @return List of all recipes.
     */
    suspend fun scan(): List<Recipe>

    /**
     * Update an existing recipe.
     */
    suspend fun update(recipeId: Long, recipe: Recipe)

    /**
     * Delete a recipe by its ID.
     */
    suspend fun delete(recipeId: Long)

    /**
     * Find recipes that use the given recipe as an ingredient.
     */
    suspend fun getRecipesUsingAsIngredient(recipeId: Long): List<RecipeReference>
}
