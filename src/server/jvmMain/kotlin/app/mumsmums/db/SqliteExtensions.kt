package app.mumsmums.db

import java.sql.ResultSet

/**
 * Safely retrieves a nullable Int from the ResultSet, handling both Int and Long types.
 */
fun ResultSet.getNullableInt(columnName: String): Int? =
    getObject(columnName)?.let {
        when (it) {
            is Int -> it
            is Long -> it.toInt()
            else -> null
        }
    }

/**
 * Safely retrieves a nullable Long from the ResultSet, handling both Int and Long types.
 */
fun ResultSet.getNullableLong(columnName: String): Long? =
    getObject(columnName)?.let {
        when (it) {
            is Long -> it
            is Int -> it.toLong()
            else -> null
        }
    }

/**
 * Safely retrieves a nullable Float from the ResultSet, converting from Double if needed.
 */
fun ResultSet.getNullableFloat(columnName: String): Float? =
    getObject(columnName)?.let {
        (it as? Double)?.toFloat()
    }
