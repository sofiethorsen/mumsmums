package app.mumsmums.db.test

import app.mumsmums.db.RecipesTable
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class RecipesTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var connection: DatabaseConnection
    private lateinit var recipesTable: RecipesTable

    @BeforeEach
    fun setUp() {
        // Use in-memory SQLite database for testing
        connection = DatabaseConnection(":memory:")
        recipesTable = RecipesTable(connection, mockIdGenerator)
    }

    @Test
    fun `When putting a recipe with an ID, it should be stored with that ID`() {
        val recipeId = 123456789L
        val recipe = createTestRecipe(recipeId = recipeId, name = "Test Recipe")

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertNotNull(retrieved)
        assertEquals(recipeId, retrieved?.recipeId)
        assertEquals("Test Recipe", retrieved?.name)
    }

    @Test
    fun `When putting a recipe without an ID, it should generate one`() {
        val recipeId = 123456789L
        every { mockIdGenerator.generateId() } returns recipeId
        val recipe = createTestRecipe(recipeId = 0L, name = "Auto ID Recipe")

        recipesTable.put(recipe)

        val allRecipes = recipesTable.scan()
        assertEquals(1, allRecipes.size)
        assertEquals(recipeId, allRecipes[0].recipeId)
        assertEquals("Auto ID Recipe", allRecipes[0].name)
    }

    @Test
    fun `When getting a non-existent recipe, it should return null`() {
        val recipeId = 123456789L
        val retrieved = recipesTable.get(recipeId)

        assertNull(retrieved)
    }

    @Test
    fun `When batch putting recipes, all should be stored`() {
        val recipeIdOne = 123456789L
        val recipeIdTwo = 456789123L
        val recipeIdThree = 7891234567L

        val recipes = listOf(
            createTestRecipe(recipeId = recipeIdOne, name = "Recipe 1"),
            createTestRecipe(recipeId = recipeIdTwo, name = "Recipe 2"),
            createTestRecipe(recipeId = recipeIdThree, name = "Recipe 3")
        )

        recipesTable.batchPut(recipes)

        val allRecipes = recipesTable.scan()
        assertEquals(3, allRecipes.size)
        assertEquals(listOf("Recipe 1", "Recipe 2", "Recipe 3"), allRecipes.map { it.name })
    }

    @Test
    fun `When scanning an empty database, it should return an empty list`() {
        val recipes = recipesTable.scan()

        assertTrue(recipes.isEmpty())
    }

    @Test
    fun `When updating a recipe, the changes should be persisted`() {
        val recipeId = 123456789L
        val original = createTestRecipe(recipeId = recipeId, name = "Original Name")
        recipesTable.put(original)

        val updated = original.copy(
            name = "Updated Name",
            description = "New description"
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals("Updated Name", retrieved?.name)
        assertEquals("New description", retrieved?.description)
    }

    @Test
    fun `When deleting a recipe, it should be removed from the database`() {
        val recipeId = 123456789L
        val recipe = createTestRecipe(recipeId = recipeId, name = "To Delete")
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        val retrieved = recipesTable.get(recipeId)
        assertNull(retrieved)
    }

    @Test
    fun `When storing a recipe with ingredients, they should be persisted correctly`() {
        val recipeId = 123456789L
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

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
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
        val recipeId = 123456789L
        val recipe = createTestRecipe(
            recipeId = recipeId,
            name = "Recipe with Steps",
            steps = listOf("Step 1", "Step 2", "Step 3")
        )

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(listOf("Step 1", "Step 2", "Step 3"), retrieved?.steps)
    }

    @Test
    fun `When storing ingredients with recipe references, they should be preserved`() {
        val recipeOneId = 123456789L
        val recipeOne = createTestRecipe(recipeId = recipeOneId, name = "Garam Masala Recipe")
        recipesTable.put(recipeOne)

        val recipeTwoId = 456789123L
        val recipeTwo = Recipe(
            recipeId = recipeTwoId,
            name = "Recipe with Linked Ingredients",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(
                        Ingredient(name = "Garam Masala", recipeId = recipeOneId),
                        Ingredient(name = "Salt", recipeId = null)
                    )
                )
            ),
            steps = listOf()
        )

        recipesTable.put(recipeTwo)

        val retrieved = recipesTable.get(recipeTwoId)
        val ingredients = retrieved?.ingredientSections?.get(0)?.ingredients
        assertEquals(recipeOneId, ingredients?.get(0)?.recipeId)
        assertNull(ingredients?.get(1)?.recipeId)
    }

    @Test
    fun `When storing multiple ingredient sections, they should be preserved in order`() {
        val recipeId = 123456789L
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

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(2, retrieved?.ingredientSections?.size)
        assertEquals("Dry Ingredients", retrieved?.ingredientSections?.get(0)?.name)
        assertEquals("Wet Ingredients", retrieved?.ingredientSections?.get(1)?.name)
    }

    @Test
    fun `When updating a recipe, old ingredients should be replaced`() {
        val recipeId = 123456789L
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
        recipesTable.put(original)

        val updated = original.copy(
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "New Ingredient"))
                )
            )
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(1, retrieved?.ingredientSections?.get(0)?.ingredients?.size)
        assertEquals("New Ingredient", retrieved?.ingredientSections?.get(0)?.ingredients?.get(0)?.name)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related ingredient sections`() {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            name = "Recipe with Sections",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = "Section 1",
                    ingredients = listOf(Ingredient(name = "Ingredient 1"))
                ),
                IngredientSection(
                    name = "Section 2",
                    ingredients = listOf(Ingredient(name = "Ingredient 2"))
                )
            ),
            steps = listOf("Step 1")
        )
        recipesTable.put(recipe)

        // Verify sections were created
        val beforeDelete = recipesTable.get(recipeId)
        assertEquals(2, beforeDelete?.ingredientSections?.size)

        // Delete recipe
        recipesTable.delete(recipeId)

        // Verify recipe and all sections are gone
        val afterDelete = recipesTable.get(recipeId)
        assertNull(afterDelete)

        // Verify orphaned sections don't exist by checking raw database
        val sectionCount = connection.connection.prepareStatement(
            "SELECT COUNT(*) FROM ingredient_sections WHERE recipeId = ?"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            resultSet.next()
            resultSet.getInt(1)
        }
        assertEquals(0, sectionCount)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related ingredients`() {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            name = "Recipe with Ingredients",
            description = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(
                        Ingredient(name = "Ingredient 1"),
                        Ingredient(name = "Ingredient 2"),
                        Ingredient(name = "Ingredient 3")
                    )
                )
            ),
            steps = listOf()
        )
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        // Verify orphaned ingredients don't exist by checking raw database
        val ingredientCount = connection.connection.prepareStatement(
            "SELECT COUNT(*) FROM ingredients WHERE sectionId IN (SELECT id FROM ingredient_sections WHERE recipeId = ?)"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            resultSet.next()
            resultSet.getInt(1)
        }
        assertEquals(0, ingredientCount)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related steps`() {
        val recipeId = 123456789L
        val recipe = createTestRecipe(
            recipeId = recipeId,
            name = "Recipe with Steps",
            steps = listOf("Step 1", "Step 2", "Step 3")
        )
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        // Verify orphaned steps don't exist by checking raw database
        val stepsCount = connection.connection.prepareStatement(
            "SELECT COUNT(*) FROM recipe_steps WHERE recipeId = ?"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            resultSet.next()
            resultSet.getInt(1)
        }
        assertEquals(0, stepsCount)
    }

    @Test
    fun `When updating a recipe, CASCADE should remove all old steps`() {
        val recipeId = 123456789L
        val original = createTestRecipe(
            recipeId = recipeId,
            name = "Original",
            steps = listOf("Old Step 1", "Old Step 2")
        )
        recipesTable.put(original)

        val updated = original.copy(
            steps = listOf("New Step 1")
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(1, retrieved?.steps?.size)
        assertEquals("New Step 1", retrieved?.steps?.get(0))

        // Verify old steps don't exist by checking count
        val stepsCount = connection.connection.prepareStatement(
            "SELECT COUNT(*) FROM recipe_steps WHERE recipeId = ?"
        ).use { statement ->
            statement.setLong(1, recipeId)
            val resultSet = statement.executeQuery()
            resultSet.next()
            resultSet.getInt(1)
        }
        assertEquals(1, stepsCount)
    }

    @Test
    fun `When a recipe is used as ingredient, getRecipesUsingAsIngredient should return the parent recipe`() {
        // Create a base recipe (e.g., "Garam Masala")
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, name = "Garam Masala")
        recipesTable.put(baseRecipe)

        // Create a recipe that uses the base recipe as an ingredient
        val parentRecipeId = 222L
        val parentRecipe = Recipe(
            recipeId = parentRecipeId,
            name = "Curry",
            description = "A curry recipe",
            imageUrl = "/images/curry.webp",
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(
                        Ingredient(name = "Garam Masala", recipeId = baseRecipeId),
                        Ingredient(name = "Chicken")
                    )
                )
            ),
            steps = listOf("Cook")
        )
        recipesTable.put(parentRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        assertEquals(1, usedIn.size)
        assertEquals(parentRecipeId, usedIn[0].recipeId)
        assertEquals("Curry", usedIn[0].name)
        assertEquals("/images/curry.webp", usedIn[0].imageUrl)
    }

    @Test
    fun `When a recipe is used in multiple recipes, getRecipesUsingAsIngredient should return all`() {
        // Create a base recipe
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, name = "Taco Seasoning")
        recipesTable.put(baseRecipe)

        // Create multiple recipes that use the base recipe
        val tacoRecipeId = 222L
        val tacoRecipe = Recipe(
            recipeId = tacoRecipeId,
            name = "Tacos",
            description = null,
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "Taco Seasoning", recipeId = baseRecipeId))
                )
            ),
            steps = listOf()
        )
        recipesTable.put(tacoRecipe)

        val burritoRecipeId = 333L
        val burritoRecipe = Recipe(
            recipeId = burritoRecipeId,
            name = "Burritos",
            description = null,
            ingredientSections = listOf(
                IngredientSection(
                    name = null,
                    ingredients = listOf(Ingredient(name = "Taco Seasoning", recipeId = baseRecipeId))
                )
            ),
            steps = listOf()
        )
        recipesTable.put(burritoRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        assertEquals(2, usedIn.size)
        // Results should be sorted by name
        assertEquals("Burritos", usedIn[0].name)
        assertEquals("Tacos", usedIn[1].name)
    }

    @Test
    fun `When a recipe is not used anywhere, getRecipesUsingAsIngredient should return empty list`() {
        val recipeId = 111L
        val recipe = createTestRecipe(recipeId = recipeId, name = "Standalone Recipe")
        recipesTable.put(recipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(recipeId)

        assertTrue(usedIn.isEmpty())
    }

    @Test
    fun `When recipe is used multiple times in same parent, getRecipesUsingAsIngredient should return it once`() {
        // Create a base recipe
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, name = "Spice Mix")
        recipesTable.put(baseRecipe)

        // Create a recipe that uses the base recipe twice (in different sections)
        val parentRecipeId = 222L
        val parentRecipe = Recipe(
            recipeId = parentRecipeId,
            name = "Complex Dish",
            description = null,
            ingredientSections = listOf(
                IngredientSection(
                    name = "Marinade",
                    ingredients = listOf(Ingredient(name = "Spice Mix", recipeId = baseRecipeId))
                ),
                IngredientSection(
                    name = "Sauce",
                    ingredients = listOf(Ingredient(name = "Spice Mix", recipeId = baseRecipeId))
                )
            ),
            steps = listOf()
        )
        recipesTable.put(parentRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        // Should only return once due to DISTINCT
        assertEquals(1, usedIn.size)
        assertEquals("Complex Dish", usedIn[0].name)
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
