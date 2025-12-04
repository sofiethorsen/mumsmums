package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import java.sql.ResultSet

/**
 * Handles CRUD operations for the recipes table.
 */
class RecipesTable(database: DatabaseConnection, private val idGenerator: NumericIdGenerator) : RecipesDatabase {
    private val connection = database.connection

    override fun get(recipeId: Long): Recipe? {
        return connection.prepareStatement("SELECT * FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toRecipe(resultSet)
            } else {
                null
            }
        }
    }

    override fun put(recipe: Recipe) = withTransaction {
        prepareInsert(recipe)
        println("Inserted recipe: ${recipe.recipeId}")
    }

    override fun batchPut(recipes: List<Recipe>) = withTransaction {
        recipes.forEach { recipe ->
            prepareInsert(recipe)
        }
        println("Loaded ${recipes.size} recipes into SQLite database")
    }

    override fun update(recipeId: Long, recipe: Recipe) = withTransaction {
        // Delete old data
        connection.prepareStatement("DELETE FROM recipe_steps WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement(
            "DELETE FROM ingredients WHERE sectionId IN (SELECT id FROM ingredient_sections WHERE recipeId = ?)"
        ).use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement("DELETE FROM ingredient_sections WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement("DELETE FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        // Insert updated recipe
        prepareInsert(recipe)
        println("Updated recipe: ${recipe.name} (ID: ${recipe.recipeId})")
    }

    override fun delete(recipeId: Long) = withTransaction {
        // Get recipe name before deleting for confirmation message
        val recipeName = connection.prepareStatement("SELECT name FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) resultSet.getString("name") else null
        }

        if (recipeName == null) {
            println("Recipe with ID $recipeId not found")
            return@withTransaction
        }

        // Delete related data
        connection.prepareStatement("DELETE FROM recipe_steps WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement(
            "DELETE FROM ingredients WHERE sectionId IN (SELECT id FROM ingredient_sections WHERE recipeId = ?)"
        ).use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement("DELETE FROM ingredient_sections WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement("DELETE FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        println("Deleted recipe: $recipeName (ID: $recipeId)")
    }

    override fun scan(): List<Recipe> {
        val recipes = mutableListOf<Recipe>()

        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery("SELECT * FROM recipes ORDER BY recipeId")
            while (resultSet.next()) {
                recipes.add(toRecipe(resultSet))
            }
        }

        return recipes
    }

    private fun prepareInsert(recipe: Recipe) {
        // Generate ID if not provided
        val recipeWithId = if (recipe.recipeId == 0L) {
            recipe.copy(recipeId = idGenerator.generateId())
        } else {
            recipe
        }

        connection.prepareStatement(
            """
            INSERT INTO recipes (recipeId, name, description, servings, numberOfUnits,
                                imageUrl, fbPreviewImageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipeWithId.recipeId)
            statement.setString(2, recipeWithId.name)
            statement.setString(3, recipeWithId.description)
            statement.setObject(4, recipeWithId.servings)
            statement.setObject(5, recipeWithId.numberOfUnits)
            statement.setString(6, recipeWithId.imageUrl)
            statement.setString(7, recipeWithId.fbPreviewImageUrl)
            statement.setLong(8, recipeWithId.version)
            statement.setLong(9, recipeWithId.createdAtInMillis)
            statement.setLong(10, recipeWithId.lastUpdatedAtInMillis)
            statement.executeUpdate()
        }

        recipeWithId.ingredientSections.forEachIndexed { sectionIndex, section ->
            val sectionId = connection.prepareStatement(
                "INSERT INTO ingredient_sections (recipeId, name, position) VALUES (?, ?, ?)",
                java.sql.Statement.RETURN_GENERATED_KEYS
            ).use { statement ->
                statement.setLong(1, recipeWithId.recipeId)
                statement.setString(2, section.name)
                statement.setInt(3, sectionIndex)
                statement.executeUpdate()
                statement.generatedKeys.use { resultSet ->
                    resultSet.next()
                    resultSet.getLong(1)
                }
            }

            section.ingredients.forEachIndexed { ingredientIndex, ingredient ->
                connection.prepareStatement(
                    "INSERT INTO ingredients (sectionId, name, volume, quantity, recipeId, position) VALUES (?, ?, ?, ?, ?, ?)"
                ).use { statement ->
                    statement.setLong(1, sectionId)
                    statement.setString(2, ingredient.name)
                    statement.setString(3, ingredient.volume)
                    statement.setObject(4, ingredient.quantity)
                    statement.setObject(5, ingredient.recipeId)
                    statement.setInt(6, ingredientIndex)
                    statement.executeUpdate()
                }
            }
        }

        recipeWithId.steps.forEachIndexed { stepIndex, step ->
            connection.prepareStatement(
                "INSERT INTO recipe_steps (recipeId, step, position) VALUES (?, ?, ?)"
            ).use { statement ->
                statement.setLong(1, recipeWithId.recipeId)
                statement.setString(2, step)
                statement.setInt(3, stepIndex)
                statement.executeUpdate()
            }
        }
    }

    private fun loadIngredientSections(recipeId: Long): List<IngredientSection> {
        val sections = mutableListOf<IngredientSection>()

        connection.prepareStatement(
            "SELECT id, name FROM ingredient_sections WHERE recipeId = ? ORDER BY position"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                val section = toIngredientSection(resultSet)
                sections.add(section)
            }
        }

        return sections
    }

    private fun loadIngredients(sectionId: Long): List<Ingredient> {
        val ingredients = mutableListOf<Ingredient>()

        connection.prepareStatement(
            "SELECT name, volume, quantity, recipeId FROM ingredients WHERE sectionId = ? ORDER BY position"
        ).use { statement ->
            statement.setLong(1, sectionId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                val ingredient = toIngredient(resultSet)
                ingredients.add(ingredient)
            }
        }

        return ingredients
    }

    private fun loadSteps(recipeId: Long): List<String> {
        val steps = mutableListOf<String>()

        connection.prepareStatement(
            "SELECT step FROM recipe_steps WHERE recipeId = ? ORDER BY position"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                steps.add(resultSet.getString("step"))
            }
        }

        return steps
    }

    private fun toRecipe(resultSet: ResultSet): Recipe {
        val recipeId = resultSet.getLong("recipeId")
        return Recipe(
            recipeId = recipeId,
            name = resultSet.getString("name"),
            description = resultSet.getString("description"),
            servings = resultSet.getNullableInt("servings"),
            numberOfUnits = resultSet.getNullableInt("numberOfUnits"),
            imageUrl = resultSet.getString("imageUrl"),
            fbPreviewImageUrl = resultSet.getString("fbPreviewImageUrl"),
            version = resultSet.getLong("version"),
            createdAtInMillis = resultSet.getLong("createdAtInMillis"),
            lastUpdatedAtInMillis = resultSet.getLong("lastUpdatedAtInMillis"),
            ingredientSections = loadIngredientSections(recipeId),
            steps = loadSteps(recipeId)
        )
    }

    private fun toIngredient(resultSet: ResultSet): Ingredient {
        return Ingredient(
            name = resultSet.getString("name"),
            volume = resultSet.getString("volume"),
            quantity = resultSet.getNullableFloat("quantity"),
            recipeId = resultSet.getNullableLong("recipeId")
        )
    }

    // Note that this loads ingredients from the database through another SELECT query
    private fun toIngredientSection(resultSet: ResultSet): IngredientSection {
        val sectionId = resultSet.getLong("id")
        return IngredientSection(
            name = resultSet.getString("name"),
            ingredients = loadIngredients(sectionId)
        )
    }

    /**
     * Executes a block of code within a transaction, commiting if successful or rolling back on exception.
     */
    private inline fun <T> withTransaction(block: () -> T): T {
        connection.autoCommit = false
        return try {
            val result = block()
            connection.commit()
            result
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }
}
