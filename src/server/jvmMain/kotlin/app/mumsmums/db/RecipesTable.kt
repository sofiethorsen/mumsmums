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
        logger.info("Inserted recipe: {} (ID: {})", recipe.nameSv, recipeId)
        recipe
    }

    suspend fun put(recipe: Recipe) = database.transaction { connection ->
        insertRecipe(connection, recipe)
        logger.info("Inserted recipe: {} (ID: {})", recipe.nameSv, recipe.recipeId)
    }

    suspend fun batchPut(recipes: List<Recipe>) = database.transaction { connection ->
        // Start by inserting all 'main' recipes - this to ensure that any foreign key requirements
        // by linked recipes are satisfied
        recipes.forEach { recipe ->
            connection.prepareStatement(
                """
                INSERT INTO recipes (recipeId, name_sv, name_en, description_sv, description_en, servings, numberOfUnits,
                                    imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """.trimIndent()
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
                statement.setString(2, recipe.nameSv)
                statement.setString(3, recipe.nameEn)
                statement.setString(4, recipe.descriptionSv)
                statement.setString(5, recipe.descriptionEn)
                statement.setObject(6, recipe.servings)
                statement.setObject(7, recipe.numberOfUnits)
                statement.setString(8, recipe.imageUrl)
                statement.setLong(9, recipe.version)
                statement.setLong(10, recipe.createdAtInMillis)
                statement.setLong(11, recipe.lastUpdatedAtInMillis)
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
            UPDATE recipes SET name_sv = ?, name_en = ?, description_sv = ?, description_en = ?,
                              servings = ?, numberOfUnits = ?,
                              imageUrl = ?, version = ?, lastUpdatedAtInMillis = ?
            WHERE recipeId = ?
            """.trimIndent()
        ).use { statement ->
            statement.setString(1, recipe.nameSv)
            statement.setString(2, recipe.nameEn)
            statement.setString(3, recipe.descriptionSv)
            statement.setString(4, recipe.descriptionEn)
            statement.setObject(5, recipe.servings)
            statement.setObject(6, recipe.numberOfUnits)
            statement.setString(7, recipe.imageUrl)
            statement.setLong(8, recipe.version)
            statement.setLong(9, recipe.lastUpdatedAtInMillis)
            statement.setLong(10, recipeId)
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
        logger.info("Updated recipe: {} (ID: {})", recipe.nameSv, recipe.recipeId)
    }

    suspend fun delete(recipeId: Long) = database.transaction { connection ->
        // Get recipe before deleting for logging and image cleanup
        val result = connection.prepareStatement("SELECT name_sv, imageUrl FROM recipes WHERE recipeId = ?").use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            if (resultSet.next()) Pair(resultSet.getString("name_sv"), resultSet.getString("imageUrl")) else null
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
            INSERT INTO recipes (recipeId, name_sv, name_en, description_sv, description_en, servings, numberOfUnits,
                                imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipe.recipeId)
            statement.setString(2, recipe.nameSv)
            statement.setString(3, recipe.nameEn)
            statement.setString(4, recipe.descriptionSv)
            statement.setString(5, recipe.descriptionEn)
            statement.setObject(6, recipe.servings)
            statement.setObject(7, recipe.numberOfUnits)
            statement.setString(8, recipe.imageUrl)
            statement.setLong(9, recipe.version)
            statement.setLong(10, recipe.createdAtInMillis)
            statement.setLong(11, recipe.lastUpdatedAtInMillis)
            statement.executeUpdate()
        }

        insertRelatedData(connection, recipe)
    }

    private fun insertRelatedData(connection: Connection, recipe: Recipe) {
        recipe.ingredientSections.forEachIndexed { sectionIndex, section ->
            val sectionId = connection.prepareStatement(
                "INSERT INTO ingredient_sections (recipeId, name_sv, name_en, position) VALUES (?, ?, ?, ?)",
                java.sql.Statement.RETURN_GENERATED_KEYS
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
                statement.setString(2, section.nameSv)
                statement.setString(3, section.nameEn)
                statement.setInt(4, sectionIndex)
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

        recipe.stepsSv.forEachIndexed { stepIndex, stepSv ->
            val stepEn = recipe.stepsEn.getOrNull(stepIndex)
            connection.prepareStatement(
                "INSERT INTO recipe_steps (recipeId, step_sv, step_en, position) VALUES (?, ?, ?, ?)"
            ).use { statement ->
                statement.setLong(1, recipe.recipeId)
                statement.setString(2, stepSv)
                statement.setString(3, stepEn)
                statement.setInt(4, stepIndex)
                statement.executeUpdate()
            }
        }
    }

    private fun loadIngredientSections(connection: Connection, recipeId: Long): List<IngredientSection> {
        val sections = mutableListOf<IngredientSection>()

        connection.prepareStatement(
            "SELECT id, name_sv, name_en FROM ingredient_sections WHERE recipeId = ? ORDER BY position"
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

    private fun loadSteps(connection: Connection, recipeId: Long): Pair<List<String>, List<String>> {
        val stepsSv = mutableListOf<String>()
        val stepsEn = mutableListOf<String>()

        connection.prepareStatement(
            "SELECT step_sv, step_en FROM recipe_steps WHERE recipeId = ? ORDER BY position"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                stepsSv.add(resultSet.getString("step_sv"))
                val en = resultSet.getString("step_en")
                if (en != null) stepsEn.add(en)
            }
        }

        return Pair(stepsSv, stepsEn)
    }

    private fun toRecipe(connection: Connection, resultSet: ResultSet): Recipe {
        val recipeId = resultSet.getLong("recipeId")
        val (stepsSv, stepsEn) = loadSteps(connection, recipeId)
        return Recipe(
            recipeId = recipeId,
            nameSv = resultSet.getString("name_sv"),
            nameEn = resultSet.getString("name_en"),
            descriptionSv = resultSet.getString("description_sv"),
            descriptionEn = resultSet.getString("description_en"),
            servings = resultSet.getNullableInt("servings"),
            numberOfUnits = resultSet.getNullableInt("numberOfUnits"),
            imageUrl = resultSet.getString("imageUrl"),
            version = resultSet.getLong("version"),
            createdAtInMillis = resultSet.getLong("createdAtInMillis"),
            lastUpdatedAtInMillis = resultSet.getLong("lastUpdatedAtInMillis"),
            ingredientSections = loadIngredientSections(connection, recipeId),
            stepsSv = stepsSv,
            stepsEn = stepsEn
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
            nameSv = resultSet.getString("name_sv"),
            nameEn = resultSet.getString("name_en"),
            ingredients = loadIngredients(connection, sectionId)
        )
    }

    suspend fun getRecipesUsingAsIngredient(recipeId: Long): List<RecipeReference> = database.execute { connection ->
        val references = mutableListOf<RecipeReference>()

        connection.prepareStatement(
            """
            SELECT DISTINCT r.recipeId, r.name_sv, r.name_en, r.imageUrl
            FROM recipes r
            JOIN ingredient_sections s ON s.recipeId = r.recipeId
            JOIN ingredients i ON i.sectionId = s.id
            WHERE i.recipeId = ?
            ORDER BY r.name_sv
            """.trimIndent()
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            while (resultSet.next()) {
                references.add(
                    RecipeReference(
                        recipeId = resultSet.getLong("recipeId"),
                        nameSv = resultSet.getString("name_sv"),
                        nameEn = resultSet.getString("name_en"),
                        imageUrl = resultSet.getString("imageUrl")
                    )
                )
            }
        }

        references
    }
}
