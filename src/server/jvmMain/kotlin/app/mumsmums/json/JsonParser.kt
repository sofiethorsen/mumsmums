package app.mumsmums.json

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.LibraryIngredient
import app.mumsmums.model.LibraryUnit
import app.mumsmums.model.Recipe
import java.io.FileReader
import java.nio.charset.Charset
import java.nio.file.Path
import kotlinx.serialization.json.Json

object JsonParser {
    private val idGenerator = NumericIdGenerator()

    private val formatter = Json {
        prettyPrint = false
    }

    fun parseRecipes(pathToFile: Path): List<Recipe> {
        return FileReader(pathToFile.toString(), Charset.forName("UTF-8")).use {
            val recipes: List<Recipe> = formatter.decodeFromString(it.buffered().readText())
            // now, link any ingredients that are also recipes themselves
            postprocess(recipes)
        }
    }

    fun parseRecipe(pathToFile: Path): Recipe {
        FileReader(pathToFile.toString(), Charset.forName("UTF-8")).use {
            val recipe: Recipe = formatter.decodeFromString(it.buffered().readText())
            return recipe.copy(recipeId = idGenerator.generateId())
        }
    }

    fun parseIngredients(pathToFile: Path): List<LibraryIngredient> {
        return FileReader(pathToFile.toString(), Charset.forName("UTF-8")).use {
            formatter.decodeFromString(it.buffered().readText())
        }
    }

    fun parseUnits(pathToFile: Path): List<LibraryUnit> {
        return FileReader(pathToFile.toString(), Charset.forName("UTF-8")).use {
            formatter.decodeFromString(it.buffered().readText())
        }
    }

    private fun postprocess(recipes: List<Recipe>): List<Recipe> {
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
        return recipes.map { recipe ->
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
            updatedRecipe
        }
    }
}
