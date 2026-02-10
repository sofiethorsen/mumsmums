package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.IngredientBase

/**
 * Handles CRUD operations for the ingredient_base table.
 */
class IngredientBaseTable(database: DatabaseConnection, private val idGenerator: NumericIdGenerator) {
    private val connection = database.connection

    fun getAll(): List<IngredientBase> {
        val bases = mutableListOf<IngredientBase>()
        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery(
                "SELECT id, name_sv, name_en FROM ingredient_base ORDER BY name_sv"
            )
            while (resultSet.next()) {
                bases.add(
                    IngredientBase(
                        id = resultSet.getLong("id"),
                        nameSv = resultSet.getString("name_sv"),
                        nameEn = resultSet.getString("name_en")
                    )
                )
            }
        }
        return bases
    }

    fun getById(id: Long): IngredientBase? {
        connection.prepareStatement(
            "SELECT id, name_sv, name_en FROM ingredient_base WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                return IngredientBase(
                    id = resultSet.getLong("id"),
                    nameSv = resultSet.getString("name_sv"),
                    nameEn = resultSet.getString("name_en")
                )
            }
        }
        return null
    }

    fun getByName(nameSv: String): IngredientBase? {
        connection.prepareStatement(
            "SELECT id, name_sv, name_en FROM ingredient_base WHERE name_sv = ?"
        ).use { statement ->
            statement.setString(1, nameSv)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                return IngredientBase(
                    id = resultSet.getLong("id"),
                    nameSv = resultSet.getString("name_sv"),
                    nameEn = resultSet.getString("name_en")
                )
            }
        }
        return null
    }

    fun search(query: String): List<IngredientBase> {
        val bases = mutableListOf<IngredientBase>()
        connection.prepareStatement(
            """
            SELECT id, name_sv, name_en FROM ingredient_base
            WHERE name_sv LIKE ? OR name_en LIKE ?
            ORDER BY name_sv
            """.trimIndent()
        ).use { statement ->
            val pattern = "%$query%"
            statement.setString(1, pattern)
            statement.setString(2, pattern)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                bases.add(
                    IngredientBase(
                        id = resultSet.getLong("id"),
                        nameSv = resultSet.getString("name_sv"),
                        nameEn = resultSet.getString("name_en")
                    )
                )
            }
        }
        return bases
    }

    fun insert(base: IngredientBase): Long {
        val id = idGenerator.generateId()
        connection.prepareStatement(
            "INSERT INTO ingredient_base (id, name_sv, name_en) VALUES (?, ?, ?)"
        ).use { statement ->
            statement.setLong(1, id)
            statement.setString(2, base.nameSv)
            statement.setString(3, base.nameEn)
            statement.executeUpdate()
        }
        return id
    }

    /**
     * Insert or get existing base by Swedish name.
     * Returns the ID of the existing or newly created base.
     */
    fun insertOrGet(nameSv: String, nameEn: String? = null): Long {
        val existing = getByName(nameSv)
        if (existing != null) {
            return existing.id
        }
        return insert(IngredientBase(id = 0, nameSv = nameSv, nameEn = nameEn))
    }

    fun update(base: IngredientBase) {
        connection.prepareStatement(
            "UPDATE ingredient_base SET name_sv = ?, name_en = ? WHERE id = ?"
        ).use { statement ->
            statement.setString(1, base.nameSv)
            statement.setString(2, base.nameEn)
            statement.setLong(3, base.id)
            statement.executeUpdate()
        }
    }

    fun delete(id: Long) {
        connection.prepareStatement(
            "DELETE FROM ingredient_base WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            statement.executeUpdate()
        }
    }
}
