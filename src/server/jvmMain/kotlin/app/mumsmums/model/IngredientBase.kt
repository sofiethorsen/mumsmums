package app.mumsmums.model

import kotlinx.serialization.Serializable

/**
 * A base ingredient concept (e.g., "koriander", "lime", "vitlök").
 * Variants like "koriander, malen" and "koriander, färsk" share the same base.
 */
@Serializable
data class IngredientBase(
    val id: Long,
    val nameSv: String,
    val nameEn: String? = null
)
