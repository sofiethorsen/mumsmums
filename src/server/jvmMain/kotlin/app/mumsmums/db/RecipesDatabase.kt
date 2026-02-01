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
    fun put(recipe: Recipe)

    /**
     * Insert a list of recipes into the database in batch.
     */
    fun batchPut(recipes: List<Recipe>)

    /**
     * Get a recipe by its ID.
     * @return The recipe if found, null otherwise.
     */
    fun get(recipeId: Long): Recipe?

    /**
     * Get all recipes from the database.
     * @return List of all recipes.
     */
    fun scan(): List<Recipe>

    /**
     * Update an existing recipe.
     */
    fun update(recipeId: Long, recipe: Recipe)

    /**
     * Delete a recipe by its ID.
     */
    fun delete(recipeId: Long)

    /**
     * Find recipes that use the given recipe as an ingredient.
     */
    fun getRecipesUsingAsIngredient(recipeId: Long): List<RecipeReference>
}
