package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Ingredient(
        val name: String,
        val volume: String? = null,
        val quantity: Float? = null,
        val recipeId: Int? = null
)
