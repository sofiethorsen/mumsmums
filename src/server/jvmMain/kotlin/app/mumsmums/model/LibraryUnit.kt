package app.mumsmums.model

import kotlinx.serialization.Serializable

/**
 * A predefined unit from the unit library.
 * Used for normalized unit selection, translations, and metric conversions.
 */
@Serializable
data class LibraryUnit(
    val id: Long,
    val shortNameSv: String,          // Short form: "msk", "g", "dl"
    val shortNameEn: String? = null,  // Short form: "tbsp", "g", "dl"
    val nameSv: String,               // Display name: "matsked", "gram", "deciliter"
    val nameEn: String? = null,       // Display name: "tablespoon", "grams", "deciliter"
    val type: UnitType,
    val mlEquivalent: Float? = null,  // For volume units: value in ml
    val gEquivalent: Float? = null    // For weight units: value in g
)

@Serializable
enum class UnitType {
    VOLUME,   // dl, msk, tsk, ml, l
    WEIGHT,   // g, kg
    COUNT,    // st, klyftor, skivor
    OTHER     // nypa, krm
}
