package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByClass
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import app.mumsmums.model.RecipeReference
import java.sql.ResultSet

/**
 * Handles CRUD operations for the recipes table.
 */
class RecipesTable(database: DatabaseConnection, private val idGenerator: NumericIdGenerator) : RecipesDatabase {
    private val connection = database.connection
    private val logger = getLoggerByClass<RecipesTable>()

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
        logger.info("Inserted recipe: {} (ID: {})", recipe.name, recipe.recipeId)
    }

    override fun batchPut(recipes: List<Recipe>) = withTransaction {
        // Start by inserting all 'main' recipes - this to ensure that any foreign key requirements
        // by linked recipes are satisfied
        recipes.forEach { recipe ->
            val recipeWithId = if (recipe.recipeId == 0L) {
                recipe.copy(recipeId = idGenerator.generateId())
            } else {
                recipe
            }

            connection.prepareStatement(
                """
                INSERT INTO recipes (recipeId, name, description, servings, numberOfUnits,
                                    imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """.trimIndent()
            ).use { statement ->
                statement.setLong(1, recipeWithId.recipeId)
                statement.setString(2, recipeWithId.name)
                statement.setString(3, recipeWithId.description)
                statement.setObject(4, recipeWithId.servings)
                statement.setObject(5, recipeWithId.numberOfUnits)
                statement.setString(6, recipeWithId.imageUrl)
                statement.setLong(7, recipeWithId.version)
                statement.setLong(8, recipeWithId.createdAtInMillis)
                statement.setLong(9, recipeWithId.lastUpdatedAtInMillis)
                statement.executeUpdate()
            }
        }

        // Now we can insert all related data (sections, ingredients, steps)
        recipes.forEach { recipe ->
            insertRelatedData(recipe)
        }

        logger.info("Loaded {} recipes into SQLite database", recipes.size)
    }

    override fun update(recipeId: Long, recipe: Recipe) = withTransaction {
        // Note that the CASCADE on the recipe table handles deletions for related data
        connection.prepareStatement("DELETE FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        // Insert updated recipe
        prepareInsert(recipe)
        logger.info("Updated recipe: {} (ID: {})", recipe.name, recipe.recipeId)
    }

    override fun delete(recipeId: Long) = withTransaction {
        // Get recipe name before deleting for confirmation message
        val recipeName = connection.prepareStatement("SELECT name FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) resultSet.getString("name") else null
        }

        if (recipeName == null) {
            logger.warn("Attempted to delete non-existent recipe with ID: {}", recipeId)
            return@withTransaction
        }

        // Note that the CASCADE on the recipe table handles deletions for related data
        connection.prepareStatement("DELETE FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        logger.info("Deleted recipe: {} (ID: {})", recipeName, recipeId)
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
                                imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipeWithId.recipeId)
            statement.setString(2, recipeWithId.name)
            statement.setString(3, recipeWithId.description)
            statement.setObject(4, recipeWithId.servings)
            statement.setObject(5, recipeWithId.numberOfUnits)
            statement.setString(6, recipeWithId.imageUrl)
            statement.setLong(7, recipeWithId.version)
            statement.setLong(8, recipeWithId.createdAtInMillis)
            statement.setLong(9, recipeWithId.lastUpdatedAtInMillis)
            statement.executeUpdate()
        }

        insertRelatedData(recipeWithId)
    }

    private fun insertRelatedData(recipe: Recipe) {
        recipe.ingredientSections.forEachIndexed { sectionIndex, section ->
            val sectionId = connection.prepareStatement(
                "INSERT INTO ingredient_sections (recipeId, name, position) VALUES (?, ?, ?)",
                java.sql.Statement.RETURN_GENERATED_KEYS
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
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
                    "INSERT INTO ingredients (sectionId, name, volume, quantity, recipeId, ingredientId, unitId, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                ).use { statement ->
                    statement.setLong(1, sectionId)
                    statement.setString(2, ingredient.name)
                    statement.setString(3, ingredient.volume)
                    statement.setObject(4, ingredient.quantity)
                    val linkedRecipeId = ingredient.recipeId
                    if (linkedRecipeId != null) {
                        statement.setLong(5, linkedRecipeId)
                    } else {
                        statement.setNull(5, java.sql.Types.BIGINT)
                    }
                    val ingredientLibraryId = ingredient.ingredientId
                    if (ingredientLibraryId != null) {
                        statement.setLong(6, ingredientLibraryId)
                    } else {
                        statement.setNull(6, java.sql.Types.BIGINT)
                    }
                    val unitLibraryId = ingredient.unitId
                    if (unitLibraryId != null) {
                        statement.setLong(7, unitLibraryId)
                    } else {
                        statement.setNull(7, java.sql.Types.BIGINT)
                    }
                    statement.setInt(8, ingredientIndex)
                    statement.executeUpdate()
                }
            }
        }

        recipe.steps.forEachIndexed { stepIndex, step ->
            connection.prepareStatement(
                "INSERT INTO recipe_steps (recipeId, step, position) VALUES (?, ?, ?)"
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
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
            "SELECT name, volume, quantity, recipeId, ingredientId, unitId FROM ingredients WHERE sectionId = ? ORDER BY position"
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
            recipeId = resultSet.getNullableLong("recipeId"),
            ingredientId = resultSet.getNullableLong("ingredientId"),
            unitId = resultSet.getNullableLong("unitId")
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

    override fun getRecipesUsingAsIngredient(recipeId: Long): List<RecipeReference> {
        val references = mutableListOf<RecipeReference>()

        connection.prepareStatement(
            """
            SELECT DISTINCT r.recipeId, r.name, r.imageUrl
            FROM recipes r
            JOIN ingredient_sections s ON s.recipeId = r.recipeId
            JOIN ingredients i ON i.sectionId = s.id
            WHERE i.recipeId = ?
            ORDER BY r.name
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                references.add(
                    RecipeReference(
                        recipeId = resultSet.getLong("recipeId"),
                        name = resultSet.getString("name"),
                        imageUrl = resultSet.getString("imageUrl")
                    )
                )
            }
        }

        return references
    }
}
