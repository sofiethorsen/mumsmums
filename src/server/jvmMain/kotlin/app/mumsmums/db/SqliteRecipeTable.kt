package app.mumsmums.db

import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import java.sql.Connection
import java.sql.DriverManager

class SqliteRecipeTable(private val dbPath: String = "recipes.db") {
    private val connection: Connection
    private val json = Json { ignoreUnknownKeys = true }

    init {
        connection = DriverManager.getConnection("jdbc:sqlite:$dbPath")
        createTables()
        reloadRecipes()
    }

    private fun createTables() {
        connection.createStatement().use { stmt ->
            stmt.execute(
                """
                CREATE TABLE IF NOT EXISTS recipes (
                    recipeId INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    servings INTEGER,
                    numberOfUnits INTEGER,
                    imageUrl TEXT,
                    fbPreviewImageUrl TEXT,
                    version INTEGER DEFAULT 0,
                    createdAtInMillis INTEGER DEFAULT 0,
                    lastUpdatedAtInMillis INTEGER DEFAULT 0
                )
                """.trimIndent()
            )

            stmt.execute(
                """
                CREATE TABLE IF NOT EXISTS ingredient_sections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipeId INTEGER NOT NULL,
                    name TEXT,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId)
                )
                """.trimIndent()
            )

            stmt.execute(
                """
                CREATE TABLE IF NOT EXISTS ingredients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sectionId INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    volume TEXT,
                    quantity REAL,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (sectionId) REFERENCES ingredient_sections(id)
                )
                """.trimIndent()
            )

            stmt.execute(
                """
                CREATE TABLE IF NOT EXISTS recipe_steps (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipeId INTEGER NOT NULL,
                    step TEXT NOT NULL,
                    position INTEGER NOT NULL,
                    FOREIGN KEY (recipeId) REFERENCES recipes(recipeId)
                )
                """.trimIndent()
            )
        }
    }

    private fun reloadRecipes() {
        // Clear existing data
        connection.createStatement().use { stmt ->
            stmt.execute("DELETE FROM recipe_steps")
            stmt.execute("DELETE FROM ingredients")
            stmt.execute("DELETE FROM ingredient_sections")
            stmt.execute("DELETE FROM recipes")
        }

        println("Loading recipes from recipes.json...")
        val jsonString = this::class.java.classLoader
            .getResourceAsStream("scripts/jvmMain/kotlin/app/mumsmums/resources/recipes.json")
            ?.bufferedReader()
            ?.use { it.readText() }
            ?: throw IllegalStateException("Could not find recipes.json in resources")

        val recipes = json.decodeFromString(ListSerializer(Recipe.serializer()), jsonString)

        connection.autoCommit = false
        try {
            recipes.forEach { recipe ->
                insertRecipe(recipe)
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

    private fun insertRecipe(recipe: Recipe) {
        connection.prepareStatement(
            """
            INSERT INTO recipes (recipeId, name, description, servings, numberOfUnits,
                                imageUrl, fbPreviewImageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """.trimIndent()
        ).use { stmt ->
            stmt.setLong(1, recipe.recipeId)
            stmt.setString(2, recipe.name)
            stmt.setString(3, recipe.description)
            stmt.setObject(4, recipe.servings)
            stmt.setObject(5, recipe.numberOfUnits)
            stmt.setString(6, recipe.imageUrl)
            stmt.setString(7, recipe.fbPreviewImageUrl)
            stmt.setLong(8, recipe.version)
            stmt.setLong(9, recipe.createdAtInMillis)
            stmt.setLong(10, recipe.lastUpdatedAtInMillis)
            stmt.executeUpdate()
        }

        recipe.ingredientSections.forEachIndexed { sectionIndex, section ->
            val sectionId = connection.prepareStatement(
                "INSERT INTO ingredient_sections (recipeId, name, position) VALUES (?, ?, ?)",
                java.sql.Statement.RETURN_GENERATED_KEYS
            ).use { stmt ->
                stmt.setLong(1, recipe.recipeId)
                stmt.setString(2, section.name)
                stmt.setInt(3, sectionIndex)
                stmt.executeUpdate()
                stmt.generatedKeys.use { rs ->
                    rs.next()
                    rs.getLong(1)
                }
            }

            section.ingredients.forEachIndexed { ingredientIndex, ingredient ->
                connection.prepareStatement(
                    "INSERT INTO ingredients (sectionId, name, volume, quantity, position) VALUES (?, ?, ?, ?, ?)"
                ).use { stmt ->
                    stmt.setLong(1, sectionId)
                    stmt.setString(2, ingredient.name)
                    stmt.setString(3, ingredient.volume)
                    stmt.setObject(4, ingredient.quantity)
                    stmt.setInt(5, ingredientIndex)
                    stmt.executeUpdate()
                }
            }
        }

        recipe.steps.forEachIndexed { stepIndex, step ->
            connection.prepareStatement(
                "INSERT INTO recipe_steps (recipeId, step, position) VALUES (?, ?, ?)"
            ).use { stmt ->
                stmt.setLong(1, recipe.recipeId)
                stmt.setString(2, step)
                stmt.setInt(3, stepIndex)
                stmt.executeUpdate()
            }
        }
    }

    fun scan(): List<Recipe> {
        val recipes = mutableListOf<Recipe>()

        connection.createStatement().use { stmt ->
            val rs = stmt.executeQuery("SELECT * FROM recipes ORDER BY recipeId")
            while (rs.next()) {
                val recipeId = rs.getLong("recipeId")
                val recipe = Recipe(
                    recipeId = recipeId,
                    name = rs.getString("name"),
                    description = rs.getString("description"),
                    servings = rs.getObject("servings") as Int?,
                    numberOfUnits = rs.getObject("numberOfUnits") as Int?,
                    imageUrl = rs.getString("imageUrl"),
                    fbPreviewImageUrl = rs.getString("fbPreviewImageUrl"),
                    version = rs.getLong("version"),
                    createdAtInMillis = rs.getLong("createdAtInMillis"),
                    lastUpdatedAtInMillis = rs.getLong("lastUpdatedAtInMillis"),
                    ingredientSections = loadIngredientSections(recipeId),
                    steps = loadSteps(recipeId)
                )
                recipes.add(recipe)
            }
        }

        return recipes
    }

    private fun loadIngredientSections(recipeId: Long): List<IngredientSection> {
        val sections = mutableListOf<IngredientSection>()

        connection.prepareStatement(
            "SELECT id, name FROM ingredient_sections WHERE recipeId = ? ORDER BY position"
        ).use { stmt ->
            stmt.setLong(1, recipeId)
            val rs = stmt.executeQuery()
            while (rs.next()) {
                val sectionId = rs.getLong("id")
                val section = IngredientSection(
                    name = rs.getString("name"),
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
            "SELECT name, volume, quantity FROM ingredients WHERE sectionId = ? ORDER BY position"
        ).use { stmt ->
            stmt.setLong(1, sectionId)
            val rs = stmt.executeQuery()
            while (rs.next()) {
                val quantityDouble = rs.getObject("quantity") as? Double
                val ingredient = Ingredient(
                    name = rs.getString("name"),
                    volume = rs.getString("volume"),
                    quantity = quantityDouble?.toFloat()
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
        ).use { stmt ->
            stmt.setLong(1, recipeId)
            val rs = stmt.executeQuery()
            while (rs.next()) {
                steps.add(rs.getString("step"))
            }
        }

        return steps
    }

    fun close() {
        connection.close()
    }
}
