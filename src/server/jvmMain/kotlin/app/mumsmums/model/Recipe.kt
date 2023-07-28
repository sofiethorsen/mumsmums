package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Recipe(
        val id: Int,
        val name: String,
        val ingredients: List<Ingredient>,
        val instruction: String,
        val imageUrl: String,
)
