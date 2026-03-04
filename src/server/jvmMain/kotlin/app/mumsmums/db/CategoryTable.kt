package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Category

/**
 * Handles CRUD operations for the category_library table
 * and recipe-category assignments in the recipe_categories join table.
 */
class CategoryTable(private val database: Database, private val idGenerator: NumericIdGenerator) {

    suspend fun getAll(): List<Category> = database.execute { connection ->
        val categories = mutableListOf<Category>()
        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery(
                "SELECT id, name_sv, name_en FROM category_library ORDER BY name_sv"
            )
            while (resultSet.next()) {
                categories.add(toCategory(resultSet))
            }
        }
        categories
    }

    suspend fun getById(id: Long): Category? = database.execute { connection ->
        connection.prepareStatement(
            "SELECT id, name_sv, name_en FROM category_library WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toCategory(resultSet)
            } else {
                null
            }
        }
    }

    suspend fun insertWithId(category: Category) = database.execute { connection ->
        connection.prepareStatement(
            "INSERT INTO category_library (id, name_sv, name_en) VALUES (?, ?, ?)"
        ).use { statement ->
            statement.setLong(1, category.id)
            statement.setString(2, category.nameSv)
            statement.setString(3, category.nameEn)
            statement.executeUpdate()
        }
    }

    suspend fun insert(category: Category): Long = database.execute { connection ->
        val id = idGenerator.generateId()
        connection.prepareStatement(
            "INSERT INTO category_library (id, name_sv, name_en) VALUES (?, ?, ?)"
        ).use { statement ->
            statement.setLong(1, id)
            statement.setString(2, category.nameSv)
            statement.setString(3, category.nameEn)
            statement.executeUpdate()
        }
        id
    }

    suspend fun update(category: Category) = database.execute { connection ->
        connection.prepareStatement(
            "UPDATE category_library SET name_sv = ?, name_en = ? WHERE id = ?"
        ).use { statement ->
            statement.setString(1, category.nameSv)
            statement.setString(2, category.nameEn)
            statement.setLong(3, category.id)
            statement.executeUpdate()
        }
    }

    suspend fun delete(id: Long) = database.execute { connection ->
        connection.prepareStatement(
            "DELETE FROM category_library WHERE id = ?"
        ).use { statement ->
            statement.setLong(1, id)
            statement.executeUpdate()
        }
    }

    suspend fun getCategoriesForRecipe(recipeId: Long): List<Category> = database.execute { connection ->
        val categories = mutableListOf<Category>()
        connection.prepareStatement(
            """
            SELECT c.id, c.name_sv, c.name_en
            FROM category_library c
            JOIN recipe_categories rc ON rc.categoryId = c.id
            WHERE rc.recipeId = ?
            ORDER BY c.name_sv
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                categories.add(toCategory(resultSet))
            }
        }
        categories
    }

    suspend fun setCategoriesForRecipe(recipeId: Long, categoryIds: List<Long>) = database.transaction { connection ->
        connection.prepareStatement(
            "DELETE FROM recipe_categories WHERE recipeId = ?"
        ).use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        if (categoryIds.isNotEmpty()) {
            connection.prepareStatement(
                "INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?)"
            ).use { statement ->
                for (categoryId in categoryIds) {
                    statement.setLong(1, recipeId)
                    statement.setLong(2, categoryId)
                    statement.addBatch()
                }
                statement.executeBatch()
            }
        }
    }

    private fun toCategory(resultSet: java.sql.ResultSet): Category {
        return Category(
            id = resultSet.getLong("id"),
            nameSv = resultSet.getString("name_sv"),
            nameEn = resultSet.getString("name_en"),
        )
    }
}
