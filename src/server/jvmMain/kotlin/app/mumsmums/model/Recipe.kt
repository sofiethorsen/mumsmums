package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val recipeId: Long,
        val name: String,
        val ingredientSections: List<IngredientSection>,
        val steps: List<String>,
        val description: String? = null,
        val servings: Int? = null,
        val numberOfUnits: Int? = null,
        val imageUrl: String? = null,
        val fbPreviewImageUrl: String? = null,
        val version: Long = 0L,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
)
