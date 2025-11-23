package app.mumsmums.db.test

import app.mumsmums.db.SqliteRecipesDatabase
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class SqliteRecipesDatabaseTest {
    private val numericIdGenerator = NumericIdGenerator()
    private lateinit var database: SqliteRecipesDatabase

    @BeforeEach
    fun setUp() {
        // Use in-memory SQLite database for testing
        database = SqliteRecipesDatabase(":memory:")
        database.createTablesIfNotExists()
    }

    @Test
    fun `When putting a recipe with an ID, it should be stored with that ID`() {
        val recipeId = numericIdGenerator.generateId()
        val recipe = createTestRecipe(recipeId = recipeId, name = "Test Recipe")

        database.put(recipe)

        val retrieved = database.get(recipeId)
        assertNotNull(retrieved)
        assertEquals(recipeId, retrieved?.recipeId)
        assertEquals("Test Recipe", retrieved?.name)
    }

    @Test
    fun `When putting a recipe without an ID, it should generate one`() {
        val recipe = createTestRecipe(recipeId = 0L, name = "Auto ID Recipe")

        database.put(recipe)

        val allRecipes = database.scan()
        assertEquals(1, allRecipes.size)
        assertNotEquals(0L, allRecipes[0].recipeId)
        assertEquals("Auto ID Recipe", allRecipes[0].name)
    }

    @Test
    fun `When getting a non-existent recipe, it should return null`() {
        val recipeId = numericIdGenerator.generateId()
        val retrieved = database.get(recipeId)

        assertNull(retrieved)
    }

    @Test
    fun `When batch putting recipes, all should be stored`() {
        val recipeIdOne = numericIdGenerator.generateId()
        val recipeIdTwo = numericIdGenerator.generateId()
        val recipeIdThree = numericIdGenerator.generateId()

        val recipes = listOf(
            createTestRecipe(recipeId = recipeIdOne, name = "Recipe 1"),
            createTestRecipe(recipeId = recipeIdTwo, name = "Recipe 2"),
            createTestRecipe(recipeId = recipeIdThree, name = "Recipe 3")
        )

        database.batchPut(recipes)

        val allRecipes = database.scan()
        assertEquals(3, allRecipes.size)
        assertEquals(listOf("Recipe 1", "Recipe 2", "Recipe 3"), allRecipes.map { it.name })
    }

    @Test
    fun `When scanning an empty database, it should return an empty list`() {
        val recipes = database.scan()

        assertTrue(recipes.isEmpty())
    }

    @Test
    fun `When updating a recipe, the changes should be persisted`() {
        val recipeId = numericIdGenerator.generateId()
        val original = createTestRecipe(recipeId = recipeId, name = "Original Name")
        database.put(original)

        val updated = original.copy(
            name = "Updated Name",
            description = "New description"
        )
        database.update(recipeId, updated)

        val retrieved = database.get(recipeId)
        assertEquals("Updated Name", retrieved?.name)
        assertEquals("New description", retrieved?.description)
    }

    @Test
    fun `When deleting a recipe, it should be removed from the database`() {
        val recipeId = numericIdGenerator.generateId()
        val recipe = createTestRecipe(recipeId = recipeId, name = "To Delete")
        database.put(recipe)

        database.delete(recipeId)

        val retrieved = database.get(recipeId)
        assertNull(retrieved)
    }

    @Test
    fun `When storing a recipe with ingredients, they should be persisted correctly`() {
        val recipeId = numericIdGenerator.generateId()
        val recipe = Recipe(
            recipeId = recipeId,
            name = "Recipe with Ingredients",
            description = "A test recipe",
            ingredientSections = listOf(
                IngredientSection(
                    name = "Main Ingredients",
                    ingredients = listOf(
                        Ingredient(name = "Flour", quantity = 2.0f, volume = "cups"),
                        Ingredient(name = "Sugar", quantity = 1.0f, volume = "cup"),
                        Ingredient(name = "Salt", volume = "pinch")
                    )
                )
            ),
            steps = listOf("Mix ingredients", "Bake")
        )

        database.put(recipe)

        val retrieved = database.get(recipeId)
        assertNotNull(retrieved)
        assertEquals(1, retrieved?.ingredientSections?.size)
        assertEquals("Main Ingredients", retrieved?.ingredientSections?.get(0)?.name)
        assertEquals(3, retrieved?.ingredientSections?.get(0)?.ingredients?.size)

        val ingredients = retrieved?.ingredientSections?.get(0)?.ingredients
        assertEquals("Flour", ingredients?.get(0)?.name)
        assertEquals(2.0f, ingredients?.get(0)?.quantity)
        assertEquals("cups", ingredients?.get(0)?.volume)
    }

    @Test
    fun `When storing a recipe with steps, they should be persisted in order`() {
        val recipeId = numericIdGenerator.generateId()
        val recipe = createTestRecipe(
            recipeId = recipeId,
            name = "Recipe with Steps",
            steps = listOf("Step 1", "Step 2", "Step 3")
        )

        database.put(recipe)

        val retrieved = database.get(recipeId)
        assertEquals(listOf("Step 1", "Step 2", "Step 3"), retrieved?.steps)
    }

    @Test
    fun `When storing ingredients with recipe references, they should be preserved`() {
        val recipeId = numericIdGenerator.generateId()
        val linkedRecipeId = numericIdGenerator.generateId()
        val recipe = Recipe(
            recipeId = recipeId,
            name = "Recipe with Linked Ingredients",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(
                        Ingredient(name = "Garam Masala", recipeId = linkedRecipeId),
                        Ingredient(name = "Salt", recipeId = null)
                    )
                )
            ),
            steps = listOf()
        )

        database.put(recipe)

        val retrieved = database.get(recipeId)
        val ingredients = retrieved?.ingredientSections?.get(0)?.ingredients
        assertEquals(linkedRecipeId, ingredients?.get(0)?.recipeId)
        assertNull(ingredients?.get(1)?.recipeId)
    }

    @Test
    fun `When storing multiple ingredient sections, they should be preserved in order`() {
        val recipeId = numericIdGenerator.generateId()
        val recipe = Recipe(
            recipeId = recipeId,
            name = "Multi-section Recipe",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = "Dry Ingredients",
                    ingredients = listOf(Ingredient(name = "Flour"))
                ),
                IngredientSection(
                    name = "Wet Ingredients",
                    ingredients = listOf(Ingredient(name = "Milk"))
                )
            ),
            steps = listOf()
        )

        database.put(recipe)

        val retrieved = database.get(recipeId)
        assertEquals(2, retrieved?.ingredientSections?.size)
        assertEquals("Dry Ingredients", retrieved?.ingredientSections?.get(0)?.name)
        assertEquals("Wet Ingredients", retrieved?.ingredientSections?.get(1)?.name)
    }

    @Test
    fun `When updating a recipe, old ingredients should be replaced`() {
        val recipeId = numericIdGenerator.generateId()
        val original = Recipe(
            recipeId = recipeId,
            name = "Original",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "Old Ingredient"))
                )
            ),
            steps = listOf()
        )
        database.put(original)

        val updated = original.copy(
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "New Ingredient"))
                )
            )
        )
        database.update(recipeId, updated)

        val retrieved = database.get(recipeId)
        assertEquals(1, retrieved?.ingredientSections?.get(0)?.ingredients?.size)
        assertEquals("New Ingredient", retrieved?.ingredientSections?.get(0)?.ingredients?.get(0)?.name)
    }

    private fun createTestRecipe(
        recipeId: Long,
        name: String,
        description: String = "Test description",
        steps: List<String> = listOf("Test step")
    ): Recipe {
        return Recipe(
            recipeId = recipeId,
            name = name,
            description = description,
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "Test Ingredient"))
                )
            ),
            steps = steps
        )
    }
}
