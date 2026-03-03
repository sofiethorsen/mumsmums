package app.mumsmums.db

import app.mumsmums.filesystem.MumsMumsPaths
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.withContext
import java.sql.Connection
import java.sql.DriverManager

/**
 * SQLite database: owns the JDBC connection, serializes access through a single-threaded
 * dispatcher, and provides [execute]/[transaction] for all query and mutation operations.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class Database(dbPath: String = MumsMumsPaths.getDbPath()) {
    private val connection: Connection

    // Single-concurrency dispatcher for all database operations. Uses IO (designed for
    // blocking I/O like JDBC calls) limited to 1 thread so that only one coroutine accesses
    // the shared JDBC connection at a time — preventing interleaved statements and transaction
    // corruption. Callers suspend (non-blocking) while waiting for their turn.
    private val dbDispatcher = Dispatchers.IO.limitedParallelism(1)

    init {
        // Ensure the parent directory exists
        val dbFile = java.io.File(dbPath)
        dbFile.parentFile?.mkdirs()
        connection = DriverManager.getConnection("jdbc:sqlite:$dbPath")

        // Enable foreign key constraints (required to use CASCADE for example)
        connection.createStatement().use { statement ->
            statement.execute("PRAGMA foreign_keys = ON")
        }

        // Enable WAL mode for better read concurrency
        connection.createStatement().use { statement ->
            statement.execute("PRAGMA journal_mode = WAL")
        }

        // Create tables if they don't exist
        createTablesIfNotExists()

        // Run migrations for existing databases
        runMigrations()
    }

    /**
     * Run a read or single-statement write on the DB dispatcher.
     */
    suspend fun <T> execute(block: (Connection) -> T): T = withContext(dbDispatcher) { block(connection) }

    /**
     * Run a multi-statement write as an atomic transaction on the DB dispatcher.
     * Commits on success, rolls back on exception.
     */
    suspend fun <T> transaction(block: (Connection) -> T): T = withContext(dbDispatcher) {
        connection.autoCommit = false
        try {
            val result = block(connection)
            connection.commit()
            result
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }

    fun createTablesIfNotExists() {
        connection.createStatement().use { statement ->
            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_version (
                    version INTEGER NOT NULL
                )
                """.trimIndent()
            )

            statement.execute(
                """
                CREATE TABLE IF NOT EXISTS recipes (
                    recipeId INTEGER PRIMARY KEY,
                    name_sv TEXT NOT NULL,
                    name_en TEXT,
                    description_sv TEXT,
                    description_en TEXT,
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
                    name_sv TEXT,
                    name_en TEXT,
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
                    step_sv TEXT NOT NULL,
                    step_en TEXT,
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

    private fun getSchemaVersion(): Int {
        return connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery("SELECT version FROM schema_version LIMIT 1")
            if (resultSet.next()) resultSet.getInt("version") else 0
        }
    }

    private fun setSchemaVersion(version: Int) {
        connection.createStatement().use { statement ->
            statement.execute("DELETE FROM schema_version")
            statement.execute("INSERT INTO schema_version (version) VALUES ($version)")
        }
    }

    private fun runMigrations() {
        val currentVersion = getSchemaVersion()

        if (currentVersion < 1) {
            migrationV1()
            setSchemaVersion(1)
        }
    }

    /**
     * Migration 1: Rename recipe text fields to *_sv and add *_en counterparts.
     * Only runs if the old column names still exist (i.e., database was created before this migration).
     */
    private fun migrationV1() {
        // Check if the old 'name' column exists on the recipes table
        val hasOldColumn = connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery("PRAGMA table_info(recipes)")
            var found = false
            while (resultSet.next()) {
                if (resultSet.getString("name") == "name") {
                    found = true
                    break
                }
            }
            found
        }

        if (!hasOldColumn) return // Fresh database with new schema, nothing to migrate

        connection.createStatement().use { statement ->
            // Recipes table
            statement.execute("ALTER TABLE recipes RENAME COLUMN name TO name_sv")
            statement.execute("ALTER TABLE recipes ADD COLUMN name_en TEXT")
            statement.execute("ALTER TABLE recipes RENAME COLUMN description TO description_sv")
            statement.execute("ALTER TABLE recipes ADD COLUMN description_en TEXT")

            // Ingredient sections table
            statement.execute("ALTER TABLE ingredient_sections RENAME COLUMN name TO name_sv")
            statement.execute("ALTER TABLE ingredient_sections ADD COLUMN name_en TEXT")

            // Recipe steps table
            statement.execute("ALTER TABLE recipe_steps RENAME COLUMN step TO step_sv")
            statement.execute("ALTER TABLE recipe_steps ADD COLUMN step_en TEXT")
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
            statement.execute("DROP TABLE IF EXISTS schema_version")
        }
    }
}
