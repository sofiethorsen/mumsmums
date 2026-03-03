package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class IngredientSection(val nameSv: String?, val nameEn: String? = null, val ingredients: List<Ingredient>)
