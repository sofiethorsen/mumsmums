package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class IngredientSection(val name: String?, val ingredients: List<Ingredient>)
