package app.mumsmums.model

import kotlinx.serialization.Serializable

/**
 * A specific ingredient variant from the library.
 *
 * Examples:
 * - base: "koriander", qualifier: "malen" → "koriander, malen" (ground coriander)
 * - base: "koriander", qualifier: "färsk" → "koriander, färsk" (fresh cilantro)
 * - base: "lime", qualifier: null → "lime"
 * - base: "lime", qualifier: "juice" → "limejuice", derivesFromId points to "lime"
 */
@Serializable
data class LibraryIngredient(
    val id: Long,
    val baseId: Long,
    val qualifierSv: String? = null,    // "malen", "färsk", "juice", etc.
    val qualifierEn: String? = null,
    val derivesFromId: Long? = null,    // FK to another LibraryIngredient (e.g., limejuice derives from lime)

    // Denormalized for convenience - populated from base + qualifier
    val fullNameSv: String,             // "koriander, malen" or "lime"
    val fullNameEn: String? = null      // "ground coriander" or "lime"
)
