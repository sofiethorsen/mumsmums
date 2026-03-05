package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: Long,
    val nameSv: String,
    val nameEn: String,
)
