package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable
import app.mumsmums.model.Recipe
import kotlin.io.path.Path

private val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
private val table = RecipeTable(amazonDynamoDb)

fun main() {
    val home = System.getenv("HOME")
    val repoFolder = "Snapchat/Dev/mumsmums/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipe.json"
    val path = "$home/$repoFolder"

    val recipeWithId = JsonParser.parseRecipe(Path(path))

    // store the new recipe
    table.put(recipeWithId)

    // now see if we need to make any updates
    val allRecipes = table.scan()

    val updates = filterNeedUpdate(allRecipes)

    updates.forEach { recipe ->
        table.update(recipe.recipeId, recipe, setOf("ingredientSections"))
    }
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
