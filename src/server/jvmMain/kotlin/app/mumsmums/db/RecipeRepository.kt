package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Recipe

class RecipeRepository(private val recipesDatabase: RecipesDatabase, private val idGenerator: NumericIdGenerator) {
    private val cache = HashMap<Long, Recipe>()
    private var allRecipes = listOf<Recipe>()

    init {
        // populate the cache on init
        val items = recipesDatabase.scan()
        items.forEach {
            cache[it.recipeId] = it
        }

        allRecipes = cache.values.toList().sortedBy { it.recipeId }.toList()
    }

    fun getAllRecipes(): List<Recipe> {
        return allRecipes
    }

    fun getRecipeById(id: Long): Recipe? {
        return cache[id]
    }

    fun createRecipeId(): Long {
        return idGenerator.generateId()
    }

    fun createRecipe(recipe: Recipe) {
        recipesDatabase.put(recipe)
        cache[recipe.recipeId] = recipe
        refreshAllRecipes()
    }

    fun updateRecipe(recipeId: Long, recipe: Recipe) {
        recipesDatabase.update(recipeId, recipe)
        cache[recipeId] = recipe
        refreshAllRecipes()
    }

    fun deleteRecipe(recipeId: Long) {
        recipesDatabase.delete(recipeId)
        cache.remove(recipeId)
        refreshAllRecipes()
    }

    private fun refreshAllRecipes() {
        allRecipes = cache.values.toList().sortedBy { it.recipeId }.toList()
    }

}
