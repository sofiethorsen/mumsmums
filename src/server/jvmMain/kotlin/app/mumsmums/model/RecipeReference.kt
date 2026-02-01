package app.mumsmums.model

import kotlinx.serialization.Serializable

/**
 * A lightweight reference to a recipe, used for linking (e.g., "usedIn" lists).
 */
@Serializable
data class RecipeReference(
    val recipeId: Long,
    val name: String,
    val imageUrl: String? = null
)
