package app.mumsmums.db.test

import app.mumsmums.db.CategoryTable
import app.mumsmums.db.Database
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Category
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class CategoryTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var database: Database
    private lateinit var table: CategoryTable
    private var nextId = 1L

    @BeforeEach
    fun setUp() {
        database = Database(":memory:")
        nextId = 1L
        every { mockIdGenerator.generateId() } answers { nextId++ }
        table = CategoryTable(database, mockIdGenerator)
    }

    @Test
    fun `insert creates a new category and returns its id`() = runTest {
        val id = table.insert(Category(id = 0, nameSv = "Bakverk", nameEn = "Baking"))

        assertTrue(id > 0)
        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("Bakverk", found?.nameSv)
        assertEquals("Baking", found?.nameEn)
    }

    @Test
    fun `insert with null nameEn works`() = runTest {
        val id = table.insert(Category(id = 0, nameSv = "Middag"))

        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("Middag", found?.nameSv)
        assertNull(found?.nameEn)
    }

    @Test
    fun `insert with duplicate nameSv throws exception`() = runTest {
        table.insert(Category(id = 0, nameSv = "Bakverk", nameEn = "Baking"))

        assertThrows<SQLException> {
            runBlocking { table.insert(Category(id = 0, nameSv = "Bakverk", nameEn = "Pastries")) }
        }
    }

    @Test
    fun `getById returns null for non-existent id`() = runTest {
        assertNull(table.getById(999999L))
    }

    @Test
    fun `getAll returns all categories sorted by nameSv`() = runTest {
        table.insert(Category(id = 0, nameSv = "Middag", nameEn = "Dinner"))
        table.insert(Category(id = 0, nameSv = "Bakverk", nameEn = "Baking"))
        table.insert(Category(id = 0, nameSv = "Frukost", nameEn = "Breakfast"))

        val all = table.getAll()

        assertEquals(3, all.size)
        assertEquals("Bakverk", all[0].nameSv)
        assertEquals("Frukost", all[1].nameSv)
        assertEquals("Middag", all[2].nameSv)
    }

    @Test
    fun `getAll returns empty list when no categories exist`() = runTest {
        assertTrue(table.getAll().isEmpty())
    }

    @Test
    fun `update modifies category`() = runTest {
        val id = table.insert(Category(id = 0, nameSv = "Bakverk"))

        table.update(Category(id = id, nameSv = "Bakverk", nameEn = "Baking"))

        val updated = table.getById(id)
        assertEquals("Bakverk", updated?.nameSv)
        assertEquals("Baking", updated?.nameEn)
    }

    @Test
    fun `delete removes category`() = runTest {
        val id = table.insert(Category(id = 0, nameSv = "Bakverk"))

        table.delete(id)

        assertNull(table.getById(id))
    }

    // --- Recipe-category join table tests ---

    private fun insertTestRecipe(recipeId: Long) = runBlocking {
        database.execute { connection ->
            connection.prepareStatement(
                "INSERT INTO recipes (recipeId, name_sv) VALUES (?, ?)"
            ).use { statement ->
                statement.setLong(1, recipeId)
                statement.setString(2, "Testrecept $recipeId")
                statement.executeUpdate()
            }
        }
    }

    @Test
    fun `setCategoriesForRecipe and getCategoriesForRecipe work together`() = runTest {
        insertTestRecipe(100L)
        val bakingId = table.insert(Category(id = 0, nameSv = "Bakverk", nameEn = "Baking"))
        val breakfastId = table.insert(Category(id = 0, nameSv = "Frukost", nameEn = "Breakfast"))

        table.setCategoriesForRecipe(100L, listOf(bakingId, breakfastId))

        val categories = table.getCategoriesForRecipe(100L)
        assertEquals(2, categories.size)
        assertEquals("Bakverk", categories[0].nameSv)
        assertEquals("Frukost", categories[1].nameSv)
    }

    @Test
    fun `setCategoriesForRecipe replaces previous assignments`() = runTest {
        insertTestRecipe(100L)
        val bakingId = table.insert(Category(id = 0, nameSv = "Bakverk"))
        val breakfastId = table.insert(Category(id = 0, nameSv = "Frukost"))
        val dinnerId = table.insert(Category(id = 0, nameSv = "Middag"))

        table.setCategoriesForRecipe(100L, listOf(bakingId, breakfastId))
        table.setCategoriesForRecipe(100L, listOf(dinnerId))

        val categories = table.getCategoriesForRecipe(100L)
        assertEquals(1, categories.size)
        assertEquals("Middag", categories[0].nameSv)
    }

    @Test
    fun `setCategoriesForRecipe with empty list clears assignments`() = runTest {
        insertTestRecipe(100L)
        val bakingId = table.insert(Category(id = 0, nameSv = "Bakverk"))
        table.setCategoriesForRecipe(100L, listOf(bakingId))

        table.setCategoriesForRecipe(100L, emptyList())

        assertTrue(table.getCategoriesForRecipe(100L).isEmpty())
    }

    @Test
    fun `getCategoriesForRecipe returns empty for recipe with no categories`() = runTest {
        insertTestRecipe(100L)

        assertTrue(table.getCategoriesForRecipe(100L).isEmpty())
    }

    @Test
    fun `deleting a category cascades to recipe_categories`() = runTest {
        insertTestRecipe(100L)
        val bakingId = table.insert(Category(id = 0, nameSv = "Bakverk"))
        val breakfastId = table.insert(Category(id = 0, nameSv = "Frukost"))
        table.setCategoriesForRecipe(100L, listOf(bakingId, breakfastId))

        table.delete(bakingId)

        val categories = table.getCategoriesForRecipe(100L)
        assertEquals(1, categories.size)
        assertEquals("Frukost", categories[0].nameSv)
    }
}
