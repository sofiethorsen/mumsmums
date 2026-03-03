package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val recipeId: Long,
        val nameSv: String,
        val ingredientSections: List<IngredientSection>,
        val stepsSv: List<String>,
        val nameEn: String? = null,
        val stepsEn: List<String> = emptyList(),
        val descriptionSv: String? = null,
        val descriptionEn: String? = null,
        val servings: Int? = null,
        val numberOfUnits: Int? = null,
        val imageUrl: String? = null,
        val version: Long = 0L,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
)
