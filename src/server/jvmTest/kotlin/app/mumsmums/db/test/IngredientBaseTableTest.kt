package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.IngredientBaseTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.IngredientBase
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class IngredientBaseTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var connection: DatabaseConnection
    private lateinit var table: IngredientBaseTable
    private var nextId = 1L

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        table = IngredientBaseTable(connection, mockIdGenerator)
        nextId = 1L
        every { mockIdGenerator.generateId() } answers { nextId++ }
    }

    @Test
    fun `insert creates a new base ingredient and returns its id`() {
        val id = table.insert(IngredientBase(0, "koriander", "coriander"))

        assertTrue(id > 0)
        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("koriander", found?.nameSv)
        assertEquals("coriander", found?.nameEn)
    }

    @Test
    fun `insert with null English name works`() {
        val id = table.insert(IngredientBase(0, "dill", null))

        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("dill", found?.nameSv)
        assertNull(found?.nameEn)
    }

    @Test
    fun `insert with duplicate Swedish name throws exception`() {
        table.insert(IngredientBase(0, "salt", null))

        assertThrows<SQLException> {
            table.insert(IngredientBase(0, "salt", null))
        }
    }

    @Test
    fun `getById returns null for non-existent id`() {
        val found = table.getById(999999L)

        assertNull(found)
    }

    @Test
    fun `getByName returns base ingredient by Swedish name`() {
        table.insert(IngredientBase(0, "peppar", "pepper"))

        val found = table.getByName("peppar")

        assertNotNull(found)
        assertEquals("peppar", found?.nameSv)
        assertEquals("pepper", found?.nameEn)
    }

    @Test
    fun `getByName returns null for non-existent name`() {
        val found = table.getByName("nonexistent")

        assertNull(found)
    }

    @Test
    fun `getAll returns all base ingredients sorted by Swedish name`() {
        table.insert(IngredientBase(0, "citron", "lemon"))
        table.insert(IngredientBase(0, "apelsin", "orange"))
        table.insert(IngredientBase(0, "banan", "banana"))

        val all = table.getAll()

        assertEquals(3, all.size)
        assertEquals("apelsin", all[0].nameSv)
        assertEquals("banan", all[1].nameSv)
        assertEquals("citron", all[2].nameSv)
    }

    @Test
    fun `getAll returns empty list when no bases exist`() {
        val all = table.getAll()

        assertTrue(all.isEmpty())
    }

    @Test
    fun `search finds bases by Swedish name`() {
        table.insert(IngredientBase(0, "vitlök", "garlic"))
        table.insert(IngredientBase(0, "lök", "onion"))
        table.insert(IngredientBase(0, "purjolök", "leek"))

        val results = table.search("lök")

        assertEquals(3, results.size)
    }

    @Test
    fun `search finds bases by English name`() {
        table.insert(IngredientBase(0, "vitlök", "garlic"))
        table.insert(IngredientBase(0, "ingefära", "ginger"))

        val results = table.search("gar")

        assertEquals(1, results.size)
        assertEquals("vitlök", results[0].nameSv)
    }

    @Test
    fun `search returns empty list when no matches`() {
        table.insert(IngredientBase(0, "salt", "salt"))

        val results = table.search("xyz")

        assertTrue(results.isEmpty())
    }

    @Test
    fun `insertOrGet returns existing id when base already exists`() {
        val firstId = table.insert(IngredientBase(0, "lime", "lime"))

        val secondId = table.insertOrGet("lime", "lime fruit")

        assertEquals(firstId, secondId)
        // Original English name should be preserved
        val found = table.getById(firstId)
        assertEquals("lime", found?.nameEn)
    }

    @Test
    fun `insertOrGet creates new base when it does not exist`() {
        val id = table.insertOrGet("mango", "mango")

        assertTrue(id > 0)
        val found = table.getById(id)
        assertEquals("mango", found?.nameSv)
        assertEquals("mango", found?.nameEn)
    }

    @Test
    fun `update modifies base ingredient`() {
        val id = table.insert(IngredientBase(0, "kanel", null))

        table.update(IngredientBase(id, "kanel", "cinnamon"))

        val updated = table.getById(id)
        assertEquals("kanel", updated?.nameSv)
        assertEquals("cinnamon", updated?.nameEn)
    }

    @Test
    fun `delete removes base ingredient`() {
        val id = table.insert(IngredientBase(0, "kardemumma", "cardamom"))

        table.delete(id)

        assertNull(table.getById(id))
    }

    @Test
    fun `delete non-existent id does not throw`() {
        assertDoesNotThrow {
            table.delete(999999L)
        }
    }
}
