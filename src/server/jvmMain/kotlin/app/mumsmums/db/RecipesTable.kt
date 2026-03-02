package app.mumsmums.db

import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.logging.getLoggerByClass
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.NewRecipe
import app.mumsmums.model.Recipe
import app.mumsmums.model.RecipeReference
import java.io.File
import java.sql.Connection
import java.sql.ResultSet

/**
 * Handles CRUD operations for the recipes table.
 */
class RecipesTable(private val database: Database, private val idGenerator: NumericIdGenerator, private val imageStoragePath: String) {
    private val logger = getLoggerByClass<RecipesTable>()

    suspend fun get(recipeId: Long): Recipe? = database.execute { connection ->
        connection.prepareStatement("SELECT * FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) {
                toRecipe(connection, resultSet)
            } else {
                null
            }
        }
    }

    suspend fun insert(newRecipe: NewRecipe): Recipe = database.transaction { connection ->
        val recipeId = idGenerator.generateId()
        val recipe = newRecipe.toRecipe(recipeId)
        insertRecipe(connection, recipe)
        logger.info("Inserted recipe: {} (ID: {})", recipe.name, recipeId)
        recipe
    }

    suspend fun put(recipe: Recipe) = database.transaction { connection ->
        insertRecipe(connection, recipe)
        logger.info("Inserted recipe: {} (ID: {})", recipe.name, recipe.recipeId)
    }

    suspend fun batchPut(recipes: List<Recipe>) = database.transaction { connection ->
        // Start by inserting all 'main' recipes - this to ensure that any foreign key requirements
        // by linked recipes are satisfied
        recipes.forEach { recipe ->
            connection.prepareStatement(
                """
                INSERT INTO recipes (recipeId, name, description, servings, numberOfUnits,
                                    imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """.trimIndent()
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
                statement.setString(2, recipe.name)
                statement.setString(3, recipe.description)
                statement.setObject(4, recipe.servings)
                statement.setObject(5, recipe.numberOfUnits)
                statement.setString(6, recipe.imageUrl)
                statement.setLong(7, recipe.version)
                statement.setLong(8, recipe.createdAtInMillis)
                statement.setLong(9, recipe.lastUpdatedAtInMillis)
                statement.executeUpdate()
            }
        }

        // Now we can insert all related data (sections, ingredients, steps)
        recipes.forEach { recipe ->
            insertRelatedData(connection, recipe)
        }

        logger.info("Loaded {} recipes into SQLite database", recipes.size)
    }

    suspend fun update(recipeId: Long, recipe: Recipe) = database.transaction { connection ->
        // Update the main recipe row (don't delete it - other recipes may reference it)
        connection.prepareStatement(
            """
            UPDATE recipes SET name = ?, description = ?, servings = ?, numberOfUnits = ?,
                              imageUrl = ?, version = ?, lastUpdatedAtInMillis = ?
            WHERE recipeId = ?
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, recipe.name)
            statement.setString(2, recipe.description)
            statement.setObject(3, recipe.servings)
            statement.setObject(4, recipe.numberOfUnits)
            statement.setString(5, recipe.imageUrl)
            statement.setLong(6, recipe.version)
            statement.setLong(7, recipe.lastUpdatedAtInMillis)
            statement.setLong(8, recipeId)
            statement.executeUpdate()
        }

        // Delete and re-insert related data (these have CASCADE and no external references)
        connection.prepareStatement("DELETE FROM ingredient_sections WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }
        connection.prepareStatement("DELETE FROM recipe_steps WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        // Re-insert the related data
        insertRelatedData(connection, recipe)
        logger.info("Updated recipe: {} (ID: {})", recipe.name, recipe.recipeId)
    }

    suspend fun delete(recipeId: Long) = database.transaction { connection ->
        // Get recipe before deleting for logging and image cleanup
        val result = connection.prepareStatement("SELECT name, imageUrl FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) Pair(resultSet.getString("name"), resultSet.getString("imageUrl")) else null
        }

        if (result == null) {
            logger.warn("Attempted to delete non-existent recipe with ID: {}", recipeId)
            return@transaction
        }

        val (recipeName, imageUrl) = result

        // Note that the CASCADE on the recipe table handles deletions for related data
        connection.prepareStatement("DELETE FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            statement.executeUpdate()
        }

        // Delete associated image file if it exists
        if (imageUrl != null) {
            try {
                val imageFile = File(imageStoragePath, "recipes/$recipeId.webp")
                if (imageFile.exists()) {
                    imageFile.delete()
                    logger.info("Deleted image file for recipe {}: {}", recipeId, imageFile.absolutePath)
                }
            } catch (e: Exception) {
                logger.error("Failed to delete image file for recipe $recipeId", e)
            }
        }

        logger.info("Deleted recipe: {} (ID: {})", recipeName, recipeId)
    }

    suspend fun scan(): List<Recipe> = database.execute { connection ->
        val recipes = mutableListOf<Recipe>()

        connection.createStatement().use { statement ->
            val resultSet = statement.executeQuery("SELECT * FROM recipes ORDER BY recipeId")
            while (resultSet.next()) {
                recipes.add(toRecipe(connection, resultSet))
            }
        }

        recipes
    }

    private fun insertRecipe(connection: Connection, recipe: Recipe) {
        connection.prepareStatement(
            """
            INSERT INTO recipes (recipeId, name, description, servings, numberOfUnits,
                                imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipe.recipeId)
            statement.setString(2, recipe.name)
            statement.setString(3, recipe.description)
            statement.setObject(4, recipe.servings)
            statement.setObject(5, recipe.numberOfUnits)
            statement.setString(6, recipe.imageUrl)
            statement.setLong(7, recipe.version)
            statement.setLong(8, recipe.createdAtInMillis)
            statement.setLong(9, recipe.lastUpdatedAtInMillis)
            statement.executeUpdate()
        }

        insertRelatedData(connection, recipe)
    }

    private fun insertRelatedData(connection: Connection, recipe: Recipe) {
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

    private fun loadIngredientSections(connection: Connection, recipeId: Long): List<IngredientSection> {
        val sections = mutableListOf<IngredientSection>()

        connection.prepareStatement(
            "SELECT id, name FROM ingredient_sections WHERE recipeId = ? ORDER BY position"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                val section = toIngredientSection(connection, resultSet)
                sections.add(section)
            }
        }

        return sections
    }

    private fun loadIngredients(connection: Connection, sectionId: Long): List<Ingredient> {
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

    private fun loadSteps(connection: Connection, recipeId: Long): List<String> {
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

    private fun toRecipe(connection: Connection, resultSet: ResultSet): Recipe {
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
            ingredientSections = loadIngredientSections(connection, recipeId),
            steps = loadSteps(connection, recipeId)
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
    private fun toIngredientSection(connection: Connection, resultSet: ResultSet): IngredientSection {
        val sectionId = resultSet.getLong("id")
        return IngredientSection(
            name = resultSet.getString("name"),
            ingredients = loadIngredients(connection, sectionId)
        )
    }

    suspend fun getRecipesUsingAsIngredient(recipeId: Long): List<RecipeReference> = database.execute { connection ->
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

        references
    }
}
