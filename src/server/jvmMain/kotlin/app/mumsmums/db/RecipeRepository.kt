package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByClass
import app.mumsmums.model.Recipe
import java.io.File

private val logger = getLoggerByClass<RecipeRepository>()

class RecipeRepository(
    private val recipesDatabase: RecipesDatabase,
    private val idGenerator: NumericIdGenerator,
    private val imageStoragePath: String
) {

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
        // Get recipe to check if it has an image
        val recipe = recipesDatabase.get(recipeId)

        // Delete from database
        recipesDatabase.delete(recipeId)

        // Delete associated image file if it exists
        if (recipe?.imageUrl != null) {
            try {
                val imageFile = File(imageStoragePath, "recipes/$recipeId.webp")
                if (imageFile.exists()) {
                    imageFile.delete()
                    logger.info("Deleted image file for recipe $recipeId: ${imageFile.absolutePath}")
                }
            } catch (e: Exception) {
                logger.error("Failed to delete image file for recipe $recipeId", e)
                // Don't fail the deletion if image cleanup fails
            }
        }
    }

}
