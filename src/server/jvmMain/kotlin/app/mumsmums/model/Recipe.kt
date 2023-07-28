package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val name: String,
        val ingredients: List<Ingredient>,
        val instruction: String,
)
