package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val id: Int,
        val name: String,
        val servings: Int?,
        val numberOfUnits: Int?,
        val ingredientSections: List<IngredientSection>,
        val steps: List<String>,
        val imageUrl: String,
)
