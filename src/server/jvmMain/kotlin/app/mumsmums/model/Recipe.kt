package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val id: Int,
        val name: String,
        val ingredientSections: List<IngredientSection>,
        val steps: List<String>,
        val imageUrl: String,
)
