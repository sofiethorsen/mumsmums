package app.mumsmums.db

import app.mumsmums.logging.getLoggerByClass
import app.mumsmums.model.User
import app.mumsmums.time.SystemTimeProvider
import app.mumsmums.time.TimeProvider
import java.sql.ResultSet
import java.sql.Statement

/**
 * Handles CRUD operations for the users table.
 */
class UsersTable(
    database: DatabaseConnection,
    private val timeProvider: TimeProvider,
) {
    private val connection = database.connection
    private val logger = getLoggerByClass<UsersTable>()

    fun findByEmail(email: String): User? {
        return connection.prepareStatement(
            "SELECT * FROM users WHERE email = ?"
        ).use { statement ->
            statement.setString(1, email)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toUser(resultSet)
            } else {
                null
            }
        }
    }

    fun findById(userId: Long): User? {
        return connection.prepareStatement(
            "SELECT * FROM users WHERE userId = ?"
        ).use { statement ->
            statement.setLong(1, userId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toUser(resultSet)
            } else {
                null
            }
        }
    }

    fun createUser(email: String, passwordHash: String): User {
        val currentTime = timeProvider.currentTimeMillis()

        val userId = connection.prepareStatement(
            """
            INSERT INTO users (email, passwordHash, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?)
            """.trimIndent(),
            Statement.RETURN_GENERATED_KEYS
        ).use { statement ->
            statement.setString(1, email)
            statement.setString(2, passwordHash)
            statement.setLong(3, currentTime)
            statement.setLong(4, currentTime)
            statement.executeUpdate()

            val generatedKeys = statement.generatedKeys
            if (generatedKeys.next()) {
                generatedKeys.getLong(1)
            } else {
                throw IllegalStateException("Failed to retrieve generated user ID")
            }
        }

        logger.info("Created user with email: {}", email)
        return User(
            userId = userId,
            email = email,
            passwordHash = passwordHash,
            createdAtInMillis = currentTime,
            lastUpdatedAtInMillis = currentTime
        )
    }

    fun updatePasswordHash(userId: Long, newPasswordHash: String): Boolean {
        val currentTime = timeProvider.currentTimeMillis()
        val rowsUpdated = connection.prepareStatement(
            "UPDATE users SET passwordHash = ?, lastUpdatedAtInMillis = ? WHERE userId = ?"
        ).use { statement ->
            statement.setString(1, newPasswordHash)
            statement.setLong(2, currentTime)
            statement.setLong(3, userId)
            statement.executeUpdate()
        }

        if (rowsUpdated > 0) {
            logger.info("Updated password for user ID: {}", userId)
        }
        return rowsUpdated > 0
    }

    private fun toUser(resultSet: ResultSet): User {
        return User(
            userId = resultSet.getLong("userId"),
            email = resultSet.getString("email"),
            passwordHash = resultSet.getString("passwordHash"),
            createdAtInMillis = resultSet.getLong("createdAtInMillis"),
            lastUpdatedAtInMillis = resultSet.getLong("lastUpdatedAtInMillis")
        )
    }
}
