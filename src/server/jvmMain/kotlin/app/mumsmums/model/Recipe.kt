package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val recipeId: Long,
        val name: String,
        val servings: Int?,
        val numberOfUnits: Int?,
        val ingredientSections: List<IngredientSection>,
        val steps: List<String>,
        val imageUrl: String,
        val version: Long = 0L,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
)
