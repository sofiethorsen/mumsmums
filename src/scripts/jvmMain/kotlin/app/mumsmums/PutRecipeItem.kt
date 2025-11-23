package app.mumsmums

import app.mumsmums.db.RecipesDatabase
import app.mumsmums.model.Recipe
import kotlin.io.path.Path

fun main() {
    // Find project root
    val projectRoot = run {
        val currentDir = java.io.File(".").absoluteFile
        var root = currentDir
        while (root != null && !java.io.File(root, "MODULE.bazel").exists()) {
            root = root.parentFile
        }
        root ?: currentDir
    }

    val dbPath = "${projectRoot.absolutePath}/sqlite/recipes.db"
    val table = RecipesDatabase(dbPath)

    // Path to the recipe JSON file
    val recipePath = "${projectRoot.absolutePath}/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipe.json"

    println("Reading recipe from: $recipePath")
    val recipeWithId = JsonParser.parseRecipe(Path(recipePath))

    // store the new recipe (ID will be generated if not present)
    table.put(recipeWithId)

    // now see if we need to make any updates
    val allRecipes = table.scan()

    val updates = filterNeedUpdate(allRecipes)

    updates.forEach { recipe ->
        table.update(recipe.recipeId, recipe)
    }

    println("Done! Added/updated ${updates.size + 1} recipe(s)")
}


private fun filterNeedUpdate(recipes: List<Recipe>): List<Recipe> {
    val recipesByName = recipes.associateBy { it.name.lowercase() }
    val recipeNames = mutableSetOf<String>()
    val ingredientNames = mutableSetOf<String>()

    // first, add all ingredient and recipe names to sets
    recipes.forEach { recipe ->
        recipeNames.add(recipe.name.lowercase())
        recipe.ingredientSections.map { section ->
            section.ingredients.map { ingredient ->
                ingredientNames.add(ingredient.name.lowercase())
            }
        }
    }

    // now, update any Ingredient within the recipes that itself is a Recipe
    return recipes.mapNotNull { recipe ->
        val sections = recipe.ingredientSections.map { section ->
            val ingredients = section.ingredients.map { ingredient ->
                val lowercaseIngredientName = ingredient.name.lowercase()
                if (recipeNames.contains(lowercaseIngredientName)) {
                    val match = recipesByName[lowercaseIngredientName]!!
                    val updatedIngredient = ingredient.copy(recipeId = match.recipeId)
                    updatedIngredient
                } else {
                    ingredient
                }
            }

            val updatedSection = section.copy(ingredients = ingredients)
            updatedSection
        }

        val updatedRecipe = recipe.copy(ingredientSections = sections)
        if (recipe != updatedRecipe) {
            updatedRecipe
        } else {
            null
        }
    }
}
