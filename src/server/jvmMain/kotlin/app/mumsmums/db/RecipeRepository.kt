package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Recipe

class RecipeRepository(private val recipesDatabase: RecipesDatabase, private val idGenerator: NumericIdGenerator) {
    fun getAllRecipes(): List<Recipe> {
        val items = recipesDatabase.scan()
        return items.sortedBy { it.recipeId }.toList()
    }

    fun getRecipeById(id: Long): Recipe? {
        return recipesDatabase.get(id)
    }

    fun createRecipeId(): Long {
        return idGenerator.generateId()
    }

    fun createRecipe(recipe: Recipe) {
        recipesDatabase.put(recipe)
    }

    fun updateRecipe(recipeId: Long, recipe: Recipe) {
        recipesDatabase.update(recipeId, recipe)
    }

    fun deleteRecipe(recipeId: Long) {
        recipesDatabase.delete(recipeId)
    }

}
