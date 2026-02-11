package app.mumsmums.db

import app.mumsmums.filesystem.MumsMumsPaths
import java.sql.Connection
import java.sql.DriverManager

/**
 * Manages the SQLite database connection and initialization.
 */
class DatabaseConnection(dbPath: String = MumsMumsPaths.getDbPath()) {
    val connection: Connection

    init {
        // Ensure the parent directory exists
        val dbFile = java.io.File(dbPath)
        dbFile.parentFile?.mkdirs()
        connection = DriverManager.getConnection("jdbc:sqlite:$dbPath")

        // Enable foreign key constraints (required to use CASCADE for example)
        connection.createStatement().use { statement ->
            statement.execute("PRAGMA foreign_keys = ON")
        }

        // Create tables if they don't exist
        createTablesIfNotExists()

        // Run migrations for existing databases
        runMigrations()
    }

    private fun runMigrations() {
        // Add ingredientId and unitId columns to ingredients table if they don't exist
        val existingColumns = mutableSetOf<String>()
        connection.createStatement().use { statement ->
            val rs = statement.executeQuery("PRAGMA table_info(ingredients)")
            while (rs.next()) {
                existingColumns.add(rs.getString("name"))
            }
        }

        connection.createStatement().use { statement ->
            if ("ingredientId" !in existingColumns) {
                statement.execute("ALTER TABLE ingredients ADD COLUMN ingredientId INTEGER REFERENCES ingredient_library(id)")
            }
            if ("unitId" !in existingColumns) {
                statement.execute("ALTER TABLE ingredients ADD COLUMN unitId INTEGER REFERENCES unit_library(id)")
            }
        }
    }

    fun createTablesIfNotExists() {
        connection.createStatement().use { statement ->
            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS recipes (
                    recipeId INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    servings INTEGER,
                    numberOfUnits INTEGER,
                    imageUrl TEXT,
                    version INTEGER DEFAULT 0,
                    createdAtInMillis INTEGER DEFAULT 0,
                    lastUpdatedAtInMillis INTEGER DEFAULT 0
                )
                """.trimIndent()
            )

            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS ingredient_sections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipeId INTEGER NOT NULL,
                    name TEXT,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
                )
                """.trimIndent()
            )

            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS ingredients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sectionId INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    volume TEXT,
                    quantity REAL,
                    recipeId INTEGER,
                    ingredientId INTEGER,
                    unitId INTEGER,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (sectionId) REFERENCES ingredient_sections(id) ON DELETE CASCADE,
                    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId),
                    FOREIGN KEY (ingredientId) REFERENCES ingredient_library(id),
                    FOREIGN KEY (unitId) REFERENCES unit_library(id)
                )
                """.trimIndent()
            )

            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS recipe_steps (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipeId INTEGER NOT NULL,
                    step TEXT NOT NULL,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
                )
                """.trimIndent()
            )

            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    userId INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    passwordHash TEXT NOT NULL,
                    createdAtInMillis INTEGER DEFAULT 0,
                    lastUpdatedAtInMillis INTEGER DEFAULT 0
                )
                """.trimIndent()
            )

            // Ingredient library with optional qualifier and derivation
            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS ingredient_library (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name_sv TEXT NOT NULL,
                    name_en TEXT,
                    qualifier_sv TEXT,
                    qualifier_en TEXT,
                    derives_from_id INTEGER,
                    full_name_sv TEXT NOT NULL UNIQUE,
                    full_name_en TEXT,
                    FOREIGN KEY (derives_from_id) REFERENCES ingredient_library(id)
                )
                """.trimIndent()
            )

            // Predefined unit library with translations and conversion data
            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS unit_library (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    short_name_sv TEXT NOT NULL UNIQUE,
                    short_name_en TEXT,
                    name_sv TEXT NOT NULL,
                    name_en TEXT,
                    type TEXT NOT NULL,
                    ml_equivalent REAL,
                    g_equivalent REAL
                )
                """.trimIndent()
            )
        }
    }

    /**
     * Drop all tables, used for resetting the database during development.
     */
    fun dropTables() {
        connection.createStatement().use { statement ->
            statement.execute("DROP TABLE IF EXISTS recipe_steps")
            statement.execute("DROP TABLE IF EXISTS ingredients")
            statement.execute("DROP TABLE IF EXISTS ingredient_sections")
            statement.execute("DROP TABLE IF EXISTS recipes")
            statement.execute("DROP TABLE IF EXISTS users")
            statement.execute("DROP TABLE IF EXISTS ingredient_library")
            statement.execute("DROP TABLE IF EXISTS unit_library")
        }
    }
}
