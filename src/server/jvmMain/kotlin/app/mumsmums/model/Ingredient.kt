package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Ingredient(val name: String, val volume: String, val quantity: Float)
