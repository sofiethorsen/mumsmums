package app.mumsmums.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
        val userId: Long,
        val email: String,
        val passwordHash: String,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
)
