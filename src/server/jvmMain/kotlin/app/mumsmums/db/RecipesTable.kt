package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe

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
                Recipe(
                    recipeId = resultSet.getLong("recipeId"),
                    name = resultSet.getString("name"),
                    description = resultSet.getString("description"),
                    servings = resultSet.getObject("servings") as Int?,
                    numberOfUnits = resultSet.getObject("numberOfUnits") as Int?,
                    imageUrl = resultSet.getString("imageUrl"),
                    fbPreviewImageUrl = resultSet.getString("fbPreviewImageUrl"),
                    version = resultSet.getLong("version"),
                    createdAtInMillis = resultSet.getLong("createdAtInMillis"),
                    lastUpdatedAtInMillis = resultSet.getLong("lastUpdatedAtInMillis"),
                    ingredientSections = loadIngredientSections(recipeId),
                    steps = loadSteps(recipeId)
                )
            } else {
                null
            }
        }
    }

    override fun put(recipe: Recipe) {
        connection.autoCommit = false
        try {
            prepareInsert(recipe)
            connection.commit()
            println("Inserted recipe: ${recipe.recipeId}")
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }

    override fun batchPut(recipes: List<Recipe>) {
        connection.autoCommit = false
        try {
            recipes.forEach { recipe ->
                prepareInsert(recipe)
            }
            connection.commit()
            println("Loaded ${recipes.size} recipes into SQLite database")
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }

    override fun update(recipeId: Long, recipe: Recipe) {
        connection.autoCommit = false
        try {
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
            connection.commit()
            println("Updated recipe: ${recipe.name} (ID: ${recipe.recipeId})")
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }

    override fun delete(recipeId: Long) {
        connection.autoCommit = false
        try {
            // Get recipe name before deleting for confirmation message
            val recipeName = connection.prepareStatement("SELECT name FROM recipes WHERE recipeId = ?").use { statement ->
                statement.setLong(1, recipeId)
                val resultSet = statement.executeQuery()
                if (resultSet.next()) resultSet.getString("name") else null
            }

            if (recipeName == null) {
                println("Recipe with ID $recipeId not found")
                return
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

            connection.commit()
            println("Deleted recipe: $recipeName (ID: $recipeId)")
        } catch (e: Exception) {
            connection.rollback()
            throw e
        } finally {
            connection.autoCommit = true
        }
    }

    override fun scan(): List<Recipe> {
        val recipes = mutableListOf<Recipe>()

        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery("SELECT * FROM recipes ORDER BY recipeId")
            while (resultSet.next()) {
                val recipeId = resultSet.getLong("recipeId")
                val recipe = Recipe(
                    recipeId = recipeId,
                    name = resultSet.getString("name"),
                    description = resultSet.getString("description"),
                    servings = resultSet.getObject("servings") as Int?,
                    numberOfUnits = resultSet.getObject("numberOfUnits") as Int?,
                    imageUrl = resultSet.getString("imageUrl"),
                    fbPreviewImageUrl = resultSet.getString("fbPreviewImageUrl"),
                    version = resultSet.getLong("version"),
                    createdAtInMillis = resultSet.getLong("createdAtInMillis"),
                    lastUpdatedAtInMillis = resultSet.getLong("lastUpdatedAtInMillis"),
                    ingredientSections = loadIngredientSections(recipeId),
                    steps = loadSteps(recipeId)
                )
                recipes.add(recipe)
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
                val sectionId = resultSet.getLong("id")
                val section = IngredientSection(
                    name = resultSet.getString("name"),
                    ingredients = loadIngredients(sectionId)
                )
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
                val quantityDouble = resultSet.getObject("quantity") as? Double
                val recipeIdValue = resultSet.getObject("recipeId")

                // If SQLite returns an INTEGER, JDBC returns it as java.lang.Integer, not java.lang.Long; therefore
                // let's ensure we can handle both
                val recipeIdLong = when (recipeIdValue) {
                    is Long -> recipeIdValue
                    is Int -> recipeIdValue.toLong()
                    else -> throw IllegalArgumentException("Unexpected type for recipeId: ${recipeIdValue?.javaClass}")
                }
                val ingredient = Ingredient(
                    name = resultSet.getString("name"),
                    volume = resultSet.getString("volume"),
                    quantity = quantityDouble?.toFloat(),
                    recipeId = recipeIdLong
                )
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
}
