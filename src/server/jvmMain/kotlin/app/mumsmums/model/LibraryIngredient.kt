package app.mumsmums.model

import kotlinx.serialization.Serializable

/**
 * A library ingredient with optional qualifier and derivation.
 *
 * Examples:
 * - name: "koriander", qualifier: "malen" → fullName: "koriander, malen" (ground coriander)
 * - name: "koriander", qualifier: "blad" → fullName: "koriander, blad" (fresh cilantro)
 * - name: "lime", qualifier: null → fullName: "lime"
 * - name: "äggula", derivesFromId: <ägg id> → distinct product derived from ägg
 *
 * Qualifier: disambiguates ambiguous base names (e.g., "koriander" can mean leaves or seeds)
 * DerivesFrom: indicates this ingredient is a distinct product derived from another (e.g., "äggula" from "ägg")
 */
@Serializable
data class LibraryIngredient(
    val id: Long,
    val nameSv: String,                  // Base name: "koriander", "ägg", "äggula"
    val nameEn: String? = null,
    val qualifierSv: String? = null,     // Disambiguator: "blad", "malen"
    val qualifierEn: String? = null,
    val derivesFromId: Long? = null,     // FK to another LibraryIngredient (e.g., äggula derives from ägg)
    val fullNameSv: String,              // Display name: "koriander, blad" or "ägg"
    val fullNameEn: String? = null
)
