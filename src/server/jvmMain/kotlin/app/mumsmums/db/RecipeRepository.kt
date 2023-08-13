package app.mumsmums.db

import app.mumsmums.model.Recipe

class RecipeRepository(recipeTable: RecipeTable) {
    private val cache = HashMap<Long, Recipe>()
    private var allRecipes = listOf<Recipe>()

    init {
        // populate the cache on init
        val items = recipeTable.scan()
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

}
