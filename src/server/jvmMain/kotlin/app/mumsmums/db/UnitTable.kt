package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.LibraryUnit
import app.mumsmums.model.UnitType

/**
 * Handles CRUD operations for the unit_library table.
 */
class UnitTable(private val database: DatabaseConnection, private val idGenerator: NumericIdGenerator) {
    private val connection = database.connection

    suspend fun getAll(): List<LibraryUnit> = database.execute {
        val units = mutableListOf<LibraryUnit>()
        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery(
                "SELECT id, short_name_sv, short_name_en, name_sv, name_en, type, ml_equivalent, g_equivalent FROM unit_library ORDER BY name_sv"
            )
            while (resultSet.next()) {
                units.add(toLibraryUnit(resultSet))
            }
        }
        units
    }

    suspend fun getById(id: Long): LibraryUnit? = database.execute {
        connection.prepareStatement(
            "SELECT id, short_name_sv, short_name_en, name_sv, name_en, type, ml_equivalent, g_equivalent FROM unit_library WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toLibraryUnit(resultSet)
            } else {
                null
            }
        }
    }

    suspend fun insert(unit: LibraryUnit): Long = database.execute {
        val id = idGenerator.generateId()
        insertWithIdInternal(unit.copy(id = id))
        id
    }

    /**
     * Insert a unit with its existing ID (used for database initialization from JSON).
     */
    suspend fun insertWithId(unit: LibraryUnit) = database.execute {
        insertWithIdInternal(unit)
    }

    private fun insertWithIdInternal(unit: LibraryUnit) {
        connection.prepareStatement(
            """
            INSERT INTO unit_library (id, short_name_sv, short_name_en, name_sv, name_en, type, ml_equivalent, g_equivalent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, unit.id)
            statement.setString(2, unit.shortNameSv)
            statement.setString(3, unit.shortNameEn)
            statement.setString(4, unit.nameSv)
            statement.setString(5, unit.nameEn)
            statement.setString(6, unit.type.name)
            statement.setObject(7, unit.mlEquivalent)
            statement.setObject(8, unit.gEquivalent)
            statement.executeUpdate()
        }
    }

    suspend fun update(unit: LibraryUnit) = database.execute {
        connection.prepareStatement(
            """
            UPDATE unit_library
            SET short_name_sv = ?, short_name_en = ?, name_sv = ?, name_en = ?, type = ?, ml_equivalent = ?, g_equivalent = ?
            WHERE id = ?
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, unit.shortNameSv)
            statement.setString(2, unit.shortNameEn)
            statement.setString(3, unit.nameSv)
            statement.setString(4, unit.nameEn)
            statement.setString(5, unit.type.name)
            statement.setObject(6, unit.mlEquivalent)
            statement.setObject(7, unit.gEquivalent)
            statement.setLong(8, unit.id)
            statement.executeUpdate()
        }
    }

    suspend fun delete(id: Long) = database.execute {
        connection.prepareStatement(
            "DELETE FROM unit_library WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            statement.executeUpdate()
        }
    }

    suspend fun batchInsert(units: List<LibraryUnit>) = database.transaction {
        connection.prepareStatement(
            """
            INSERT OR IGNORE INTO unit_library (short_name_sv, short_name_en, name_sv, name_en, type, ml_equivalent, g_equivalent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            for (unit in units) {
                statement.setString(1, unit.shortNameSv)
                statement.setString(2, unit.shortNameEn)
                statement.setString(3, unit.nameSv)
                statement.setString(4, unit.nameEn)
                statement.setString(5, unit.type.name)
                statement.setObject(6, unit.mlEquivalent)
                statement.setObject(7, unit.gEquivalent)
                statement.addBatch()
            }
            statement.executeBatch()
        }
    }

    private fun toLibraryUnit(resultSet: java.sql.ResultSet): LibraryUnit {
        return LibraryUnit(
            id = resultSet.getLong("id"),
            shortNameSv = resultSet.getString("short_name_sv"),
            shortNameEn = resultSet.getString("short_name_en"),
            nameSv = resultSet.getString("name_sv"),
            nameEn = resultSet.getString("name_en"),
            type = UnitType.valueOf(resultSet.getString("type")),
            mlEquivalent = resultSet.getFloat("ml_equivalent").takeIf { !resultSet.wasNull() },
            gEquivalent = resultSet.getFloat("g_equivalent").takeIf { !resultSet.wasNull() }
        )
    }
}
