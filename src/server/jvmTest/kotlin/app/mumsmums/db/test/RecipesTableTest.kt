package app.mumsmums.db.test

import app.mumsmums.db.RecipesTable
import app.mumsmums.db.Database
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.NewRecipe
import app.mumsmums.model.Recipe
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class RecipesTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var database: Database
    private lateinit var recipesTable: RecipesTable

    @BeforeEach
    fun setUp(@TempDir tempDir: File) {
        // Use in-memory SQLite database for testing
        database = Database(":memory:")
        recipesTable = RecipesTable(database, mockIdGenerator, tempDir.absolutePath)
    }

    @Test
    fun `When putting a recipe with an ID, it should be stored with that ID`() = runTest {
        val recipeId = 123456789L
        val recipe = createTestRecipe(recipeId = recipeId, nameSv = "Testrecept")

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertNotNull(retrieved)
        assertEquals(recipeId, retrieved?.recipeId)
        assertEquals("Testrecept", retrieved?.nameSv)
    }

    @Test
    fun `When inserting a new recipe, it should generate an ID`() = runTest {
        val recipeId = 123456789L
        every { mockIdGenerator.generateId() } returns recipeId
        val newRecipe = createTestNewRecipe(nameSv = "Automatiskt ID-recept")

        val recipe = recipesTable.insert(newRecipe)

        assertEquals(recipeId, recipe.recipeId)
        assertEquals("Automatiskt ID-recept", recipe.nameSv)
        val allRecipes = recipesTable.scan()
        assertEquals(1, allRecipes.size)
        assertEquals(recipeId, allRecipes[0].recipeId)
    }

    @Test
    fun `When getting a non-existent recipe, it should return null`() = runTest {
        val recipeId = 123456789L
        val retrieved = recipesTable.get(recipeId)

        assertNull(retrieved)
    }

    @Test
    fun `When batch putting recipes, all should be stored`() = runTest {
        val recipeIdOne = 123456789L
        val recipeIdTwo = 456789123L
        val recipeIdThree = 7891234567L

        val recipes = listOf(
            createTestRecipe(recipeId = recipeIdOne, nameSv = "Recept 1"),
            createTestRecipe(recipeId = recipeIdTwo, nameSv = "Recept 2"),
            createTestRecipe(recipeId = recipeIdThree, nameSv = "Recept 3")
        )

        recipesTable.batchPut(recipes)

        val allRecipes = recipesTable.scan()
        assertEquals(3, allRecipes.size)
        assertEquals(listOf("Recept 1", "Recept 2", "Recept 3"), allRecipes.map { it.nameSv })
    }

    @Test
    fun `When scanning an empty database, it should return an empty list`() = runTest {
        val recipes = recipesTable.scan()

        assertTrue(recipes.isEmpty())
    }

    @Test
    fun `When updating a recipe, the changes should be persisted`() = runTest {
        val recipeId = 123456789L
        val original = createTestRecipe(recipeId = recipeId, nameSv = "Ursprungligt namn")
        recipesTable.put(original)

        val updated = original.copy(
            nameSv = "Uppdaterat namn",
            descriptionSv = "Ny beskrivning"
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals("Uppdaterat namn", retrieved?.nameSv)
        assertEquals("Ny beskrivning", retrieved?.descriptionSv)
    }

    @Test
    fun `When deleting a recipe, it should be removed from the database`() = runTest {
        val recipeId = 123456789L
        val recipe = createTestRecipe(recipeId = recipeId, nameSv = "Att radera")
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        val retrieved = recipesTable.get(recipeId)
        assertNull(retrieved)
    }

    @Test
    fun `When storing a recipe with ingredients, they should be persisted correctly`() = runTest {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            nameSv = "Recept med ingredienser",
            descriptionSv = "Ett testrecept",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = "Huvudingredienser",
                    ingredients = listOf(
                        Ingredient(name = "Mjöl", quantity = 2.0f, volume = "dl"),
                        Ingredient(name = "Socker", quantity = 1.0f, volume = "dl"),
                        Ingredient(name = "Salt", volume = "nypa")
                    )
                )
            ),
            stepsSv = listOf("Blanda ingredienserna", "Grädda")
        )

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertNotNull(retrieved)
        assertEquals(1, retrieved?.ingredientSections?.size)
        assertEquals("Huvudingredienser", retrieved?.ingredientSections?.get(0)?.nameSv)
        assertEquals(3, retrieved?.ingredientSections?.get(0)?.ingredients?.size)

        val ingredients = retrieved?.ingredientSections?.get(0)?.ingredients
        assertEquals("Mjöl", ingredients?.get(0)?.name)
        assertEquals(2.0f, ingredients?.get(0)?.quantity)
        assertEquals("dl", ingredients?.get(0)?.volume)
    }

    @Test
    fun `When storing a recipe with steps, they should be persisted in order`() = runTest {
        val recipeId = 123456789L
        val recipe = createTestRecipe(
            recipeId = recipeId,
            nameSv = "Recept med steg",
            stepsSv = listOf("Steg 1", "Steg 2", "Steg 3")
        )

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(listOf("Steg 1", "Steg 2", "Steg 3"), retrieved?.stepsSv)
    }

    @Test
    fun `When storing ingredients with recipe references, they should be preserved`() = runTest {
        val recipeOneId = 123456789L
        val recipeOne = createTestRecipe(recipeId = recipeOneId, nameSv = "Garam masala-recept")
        recipesTable.put(recipeOne)

        val recipeTwoId = 456789123L
        val recipeTwo = Recipe(
            recipeId = recipeTwoId,
            nameSv = "Recept med länkade ingredienser",
            descriptionSv = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(
                        Ingredient(name = "Garam Masala", recipeId = recipeOneId),
                        Ingredient(name = "Salt", recipeId = null)
                    )
                )
            ),
            stepsSv = listOf()
        )

        recipesTable.put(recipeTwo)

        val retrieved = recipesTable.get(recipeTwoId)
        val ingredients = retrieved?.ingredientSections?.get(0)?.ingredients
        assertEquals(recipeOneId, ingredients?.get(0)?.recipeId)
        assertNull(ingredients?.get(1)?.recipeId)
    }

    @Test
    fun `When storing multiple ingredient sections, they should be preserved in order`() = runTest {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            nameSv = "Recept med flera sektioner",
            descriptionSv = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = "Torra ingredienser",
                    ingredients = listOf(Ingredient(name = "Mjöl"))
                ),
                IngredientSection(
                    nameSv = "Våta ingredienser",
                    ingredients = listOf(Ingredient(name = "Mjölk"))
                )
            ),
            stepsSv = listOf()
        )

        recipesTable.put(recipe)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(2, retrieved?.ingredientSections?.size)
        assertEquals("Torra ingredienser", retrieved?.ingredientSections?.get(0)?.nameSv)
        assertEquals("Våta ingredienser", retrieved?.ingredientSections?.get(1)?.nameSv)
    }

    @Test
    fun `When updating a recipe, old ingredients should be replaced`() = runTest {
        val recipeId = 123456789L
        val original = Recipe(
            recipeId = recipeId,
            nameSv = "Ursprungligt",
            descriptionSv = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Gammal ingrediens"))
                )
            ),
            stepsSv = listOf()
        )
        recipesTable.put(original)

        val updated = original.copy(
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Ny ingrediens"))
                )
            )
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(1, retrieved?.ingredientSections?.get(0)?.ingredients?.size)
        assertEquals("Ny ingrediens", retrieved?.ingredientSections?.get(0)?.ingredients?.get(0)?.name)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related ingredient sections`() = runTest {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            nameSv = "Recept med sektioner",
            descriptionSv = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = "Sektion 1",
                    ingredients = listOf(Ingredient(name = "Ingrediens 1"))
                ),
                IngredientSection(
                    nameSv = "Sektion 2",
                    ingredients = listOf(Ingredient(name = "Ingrediens 2"))
                )
            ),
            stepsSv = listOf("Steg 1")
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
        val sectionCount = database.execute { connection ->
            connection.prepareStatement(
                "SELECT COUNT(*) FROM ingredient_sections WHERE recipeId = ?"
            ).use { statement ->
                statement.setLong(1, recipeId)
                val resultSet = statement.executeQuery()
                resultSet.next()
                resultSet.getInt(1)
            }
        }
        assertEquals(0, sectionCount)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related ingredients`() = runTest {
        val recipeId = 123456789L
        val recipe = Recipe(
            recipeId = recipeId,
            nameSv = "Recept med ingredienser",
            descriptionSv = "Test",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(
                        Ingredient(name = "Ingrediens 1"),
                        Ingredient(name = "Ingrediens 2"),
                        Ingredient(name = "Ingrediens 3")
                    )
                )
            ),
            stepsSv = listOf()
        )
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        // Verify orphaned ingredients don't exist by checking raw database
        val ingredientCount = database.execute { connection ->
            connection.prepareStatement(
                "SELECT COUNT(*) FROM ingredients WHERE sectionId IN (SELECT id FROM ingredient_sections WHERE recipeId = ?)"
            ).use { statement ->
                statement.setLong(1, recipeId)
                val resultSet = statement.executeQuery()
                resultSet.next()
                resultSet.getInt(1)
            }
        }
        assertEquals(0, ingredientCount)
    }

    @Test
    fun `When deleting a recipe, CASCADE should remove all related steps`() = runTest {
        val recipeId = 123456789L
        val recipe = createTestRecipe(
            recipeId = recipeId,
            nameSv = "Recept med steg",
            stepsSv = listOf("Steg 1", "Steg 2", "Steg 3")
        )
        recipesTable.put(recipe)

        recipesTable.delete(recipeId)

        // Verify orphaned steps don't exist by checking raw database
        val stepsCount = database.execute { connection ->
            connection.prepareStatement(
                "SELECT COUNT(*) FROM recipe_steps WHERE recipeId = ?"
            ).use { statement ->
                statement.setLong(1, recipeId)
                val resultSet = statement.executeQuery()
                resultSet.next()
                resultSet.getInt(1)
            }
        }
        assertEquals(0, stepsCount)
    }

    @Test
    fun `When updating a recipe, CASCADE should remove all old steps`() = runTest {
        val recipeId = 123456789L
        val original = createTestRecipe(
            recipeId = recipeId,
            nameSv = "Ursprungligt",
            stepsSv = listOf("Gammalt steg 1", "Gammalt steg 2")
        )
        recipesTable.put(original)

        val updated = original.copy(
            stepsSv = listOf("Nytt steg 1")
        )
        recipesTable.update(recipeId, updated)

        val retrieved = recipesTable.get(recipeId)
        assertEquals(1, retrieved?.stepsSv?.size)
        assertEquals("Nytt steg 1", retrieved?.stepsSv?.get(0))

        // Verify old steps don't exist by checking count
        val stepsCount = database.execute { connection ->
            connection.prepareStatement(
                "SELECT COUNT(*) FROM recipe_steps WHERE recipeId = ?"
            ).use { statement ->
                statement.setLong(1, recipeId)
                val resultSet = statement.executeQuery()
                resultSet.next()
                resultSet.getInt(1)
            }
        }
        assertEquals(1, stepsCount)
    }

    @Test
    fun `When a recipe is used as ingredient, getRecipesUsingAsIngredient should return the parent recipe`() = runTest {
        // Create a base recipe (e.g., "Garam Masala")
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, nameSv = "Garam masala")
        recipesTable.put(baseRecipe)

        // Create a recipe that uses the base recipe as an ingredient
        val parentRecipeId = 222L
        val parentRecipe = Recipe(
            recipeId = parentRecipeId,
            nameSv = "Currygryta",
            descriptionSv = "En currygryta",
            imageUrl = "/images/curry.webp",
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(
                        Ingredient(name = "Garam Masala", recipeId = baseRecipeId),
                        Ingredient(name = "Chicken")
                    )
                )
            ),
            stepsSv = listOf("Tillaga")
        )
        recipesTable.put(parentRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        assertEquals(1, usedIn.size)
        assertEquals(parentRecipeId, usedIn[0].recipeId)
        assertEquals("Currygryta", usedIn[0].nameSv)
        assertEquals("/images/curry.webp", usedIn[0].imageUrl)
    }

    @Test
    fun `When a recipe is used in multiple recipes, getRecipesUsingAsIngredient should return all`() = runTest {
        // Create a base recipe
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, nameSv = "Tacokrydda")
        recipesTable.put(baseRecipe)

        // Create multiple recipes that use the base recipe
        val tacoRecipeId = 222L
        val tacoRecipe = Recipe(
            recipeId = tacoRecipeId,
            nameSv = "Tacos",
            descriptionSv = null,
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Tacokrydda", recipeId = baseRecipeId))
                )
            ),
            stepsSv = listOf()
        )
        recipesTable.put(tacoRecipe)

        val burritoRecipeId = 333L
        val burritoRecipe = Recipe(
            recipeId = burritoRecipeId,
            nameSv = "Burritos",
            descriptionSv = null,
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Tacokrydda", recipeId = baseRecipeId))
                )
            ),
            stepsSv = listOf()
        )
        recipesTable.put(burritoRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        assertEquals(2, usedIn.size)
        // Results should be sorted by name
        assertEquals("Burritos", usedIn[0].nameSv)
        assertEquals("Tacos", usedIn[1].nameSv)
    }

    @Test
    fun `When a recipe is not used anywhere, getRecipesUsingAsIngredient should return empty list`() = runTest {
        val recipeId = 111L
        val recipe = createTestRecipe(recipeId = recipeId, nameSv = "Fristående recept")
        recipesTable.put(recipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(recipeId)

        assertTrue(usedIn.isEmpty())
    }

    @Test
    fun `When recipe is used multiple times in same parent, getRecipesUsingAsIngredient should return it once`() = runTest {
        // Create a base recipe
        val baseRecipeId = 111L
        val baseRecipe = createTestRecipe(recipeId = baseRecipeId, nameSv = "Kryddblandning")
        recipesTable.put(baseRecipe)

        // Create a recipe that uses the base recipe twice (in different sections)
        val parentRecipeId = 222L
        val parentRecipe = Recipe(
            recipeId = parentRecipeId,
            nameSv = "Komplicerad rätt",
            descriptionSv = null,
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = "Marinad",
                    ingredients = listOf(Ingredient(name = "Kryddblandning", recipeId = baseRecipeId))
                ),
                IngredientSection(
                    nameSv = "Sås",
                    ingredients = listOf(Ingredient(name = "Kryddblandning", recipeId = baseRecipeId))
                )
            ),
            stepsSv = listOf()
        )
        recipesTable.put(parentRecipe)

        val usedIn = recipesTable.getRecipesUsingAsIngredient(baseRecipeId)

        // Should only return once due to DISTINCT
        assertEquals(1, usedIn.size)
        assertEquals("Komplicerad rätt", usedIn[0].nameSv)
    }

    private fun createTestRecipe(
        recipeId: Long,
        nameSv: String,
        descriptionSv: String = "Testbeskrivning",
        stepsSv: List<String> = listOf("Teststeg")
    ): Recipe {
        return Recipe(
            recipeId = recipeId,
            nameSv = nameSv,
            descriptionSv = descriptionSv,
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Testingrediens"))
                )
            ),
            stepsSv = stepsSv
        )
    }

    private fun createTestNewRecipe(
        nameSv: String,
        descriptionSv: String = "Testbeskrivning",
        stepsSv: List<String> = listOf("Teststeg")
    ): NewRecipe {
        return NewRecipe(
            nameSv = nameSv,
            descriptionSv = descriptionSv,
            ingredientSections = listOf(
                IngredientSection(
                    nameSv = null,
                    ingredients = listOf(Ingredient(name = "Testingrediens"))
                )
            ),
            stepsSv = stepsSv
        )
    }
}
