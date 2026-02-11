package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.LibraryIngredient

/**
 * Handles CRUD operations for the ingredient_library table.
 */
class IngredientTable(database: DatabaseConnection, private val idGenerator: NumericIdGenerator) {
    private val connection = database.connection

    fun getAll(): List<LibraryIngredient> {
        val ingredients = mutableListOf<LibraryIngredient>()
        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery(
                """
                SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
                FROM ingredient_library
                ORDER BY full_name_sv
                """.trimIndent()
            )
            while (resultSet.next()) {
                ingredients.add(toLibraryIngredient(resultSet))
            }
        }
        return ingredients
    }

    fun getById(id: Long): LibraryIngredient? {
        connection.prepareStatement(
            """
            SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
            FROM ingredient_library WHERE id = ?
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, id)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                return toLibraryIngredient(resultSet)
            }
        }
        return null
    }

    fun getByName(nameSv: String): LibraryIngredient? {
        connection.prepareStatement(
            """
            SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
            FROM ingredient_library WHERE name_sv = ? AND qualifier_sv IS NULL
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, nameSv)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                return toLibraryIngredient(resultSet)
            }
        }
        return null
    }

    /**
     * Get all ingredients that derive from the given ingredient.
     * E.g., if ingredientId is "ägg", returns ["äggula", "äggvita"].
     */
    fun getDerivedFrom(ingredientId: Long): List<LibraryIngredient> {
        val ingredients = mutableListOf<LibraryIngredient>()
        connection.prepareStatement(
            """
            SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
            FROM ingredient_library
            WHERE derives_from_id = ?
            ORDER BY full_name_sv
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, ingredientId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                ingredients.add(toLibraryIngredient(resultSet))
            }
        }
        return ingredients
    }

    fun search(query: String): List<LibraryIngredient> {
        val ingredients = mutableListOf<LibraryIngredient>()
        connection.prepareStatement(
            """
            SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
            FROM ingredient_library
            WHERE full_name_sv LIKE ? OR full_name_en LIKE ? OR name_sv LIKE ? OR name_en LIKE ?
            ORDER BY full_name_sv
            """.trimIndent()
        ).use { statement ->
            val pattern = "%$query%"
            statement.setString(1, pattern)
            statement.setString(2, pattern)
            statement.setString(3, pattern)
            statement.setString(4, pattern)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                ingredients.add(toLibraryIngredient(resultSet))
            }
        }
        return ingredients
    }

    fun insert(ingredient: LibraryIngredient): Long {
        val id = idGenerator.generateId()
        insertWithId(ingredient.copy(id = id))
        return id
    }

    /**
     * Insert an ingredient with its existing ID (used for database initialization from JSON).
     */
    fun insertWithId(ingredient: LibraryIngredient) {
        connection.prepareStatement(
            """
            INSERT INTO ingredient_library (id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, ingredient.id)
            statement.setString(2, ingredient.nameSv)
            statement.setString(3, ingredient.nameEn)
            statement.setString(4, ingredient.qualifierSv)
            statement.setString(5, ingredient.qualifierEn)
            statement.setObject(6, ingredient.derivesFromId)
            statement.setString(7, ingredient.fullNameSv)
            statement.setString(8, ingredient.fullNameEn)
            statement.executeUpdate()
        }
    }

    fun update(ingredient: LibraryIngredient) {
        connection.prepareStatement(
            """
            UPDATE ingredient_library
            SET name_sv = ?, name_en = ?, qualifier_sv = ?, qualifier_en = ?, derives_from_id = ?, full_name_sv = ?, full_name_en = ?
            WHERE id = ?
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, ingredient.nameSv)
            statement.setString(2, ingredient.nameEn)
            statement.setString(3, ingredient.qualifierSv)
            statement.setString(4, ingredient.qualifierEn)
            statement.setObject(5, ingredient.derivesFromId)
            statement.setString(6, ingredient.fullNameSv)
            statement.setString(7, ingredient.fullNameEn)
            statement.setLong(8, ingredient.id)
            statement.executeUpdate()
        }
    }

    fun delete(id: Long) {
        connection.prepareStatement(
            "DELETE FROM ingredient_library WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            statement.executeUpdate()
        }
    }

    private fun toLibraryIngredient(resultSet: java.sql.ResultSet): LibraryIngredient {
        val derivesFromIdRaw = resultSet.getLong("derives_from_id")
        val derivesFromId = if (resultSet.wasNull()) null else derivesFromIdRaw
        return LibraryIngredient(
            id = resultSet.getLong("id"),
            nameSv = resultSet.getString("name_sv"),
            nameEn = resultSet.getString("name_en"),
            qualifierSv = resultSet.getString("qualifier_sv"),
            qualifierEn = resultSet.getString("qualifier_en"),
            derivesFromId = derivesFromId,
            fullNameSv = resultSet.getString("full_name_sv"),
            fullNameEn = resultSet.getString("full_name_en")
        )
    }
}
