package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.IngredientTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.LibraryIngredient
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class IngredientTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var connection: DatabaseConnection
    private lateinit var table: IngredientTable
    private var nextId = 1L

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        nextId = 1L
        every { mockIdGenerator.generateId() } answers { nextId++ }
        table = IngredientTable(connection, mockIdGenerator)
    }

    @Test
    fun `insert creates a new ingredient and returns its id`() {
        val id = table.insert(
            LibraryIngredient(
                id = 0,
                nameSv = "koriander",
                nameEn = "coriander",
                qualifierSv = "malen",
                qualifierEn = "ground",
                derivesFromId = null,
                fullNameSv = "koriander, malen",
                fullNameEn = "ground coriander"
            )
        )

        assertTrue(id > 0)
        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("koriander", found?.nameSv)
        assertEquals("coriander", found?.nameEn)
        assertEquals("malen", found?.qualifierSv)
        assertEquals("ground", found?.qualifierEn)
        assertEquals("koriander, malen", found?.fullNameSv)
        assertEquals("ground coriander", found?.fullNameEn)
        assertNull(found?.derivesFromId)
    }

    @Test
    fun `insert with null optional fields works`() {
        val id = table.insert(
            LibraryIngredient(
                id = 0,
                nameSv = "lime",
                nameEn = null,
                qualifierSv = null,
                qualifierEn = null,
                derivesFromId = null,
                fullNameSv = "lime",
                fullNameEn = null
            )
        )

        val found = table.getById(id)
        assertNotNull(found)
        assertNull(found?.nameEn)
        assertNull(found?.qualifierSv)
        assertNull(found?.qualifierEn)
        assertNull(found?.fullNameEn)
    }

    @Test
    fun `insert with derivesFromId creates derivation relationship`() {
        val eggId = table.insert(
            LibraryIngredient(0, "ägg", "egg", null, null, null, "ägg", "egg")
        )
        val eggYolkId = table.insert(
            LibraryIngredient(0, "äggula", "egg yolk", null, null, eggId, "äggula", "egg yolk")
        )

        val eggYolk = table.getById(eggYolkId)
        assertEquals(eggId, eggYolk?.derivesFromId)
    }

    @Test
    fun `insert with duplicate fullNameSv throws exception`() {
        table.insert(
            LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null)
        )

        assertThrows<SQLException> {
            table.insert(
                LibraryIngredient(0, "koriander", null, "färsk", null, null, "koriander", null)
            )
        }
    }

    @Test
    fun `getById returns null for non-existent id`() {
        val found = table.getById(999999L)

        assertNull(found)
    }

    @Test
    fun `getAll returns all ingredients sorted by Swedish name`() {
        table.insert(LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, "lime", null, null, null, null, "lime", null))
        table.insert(LibraryIngredient(0, "koriander", null, "malen", null, null, "koriander, malen", null))

        val all = table.getAll()

        assertEquals(3, all.size)
        assertEquals("koriander", all[0].fullNameSv)
        assertEquals("koriander, malen", all[1].fullNameSv)
        assertEquals("lime", all[2].fullNameSv)
    }

    @Test
    fun `getDerivedFrom returns all ingredients derived from given ingredient`() {
        val eggId = table.insert(
            LibraryIngredient(0, "ägg", null, null, null, null, "ägg", null)
        )
        table.insert(
            LibraryIngredient(0, "äggula", null, null, null, eggId, "äggula", null)
        )
        table.insert(
            LibraryIngredient(0, "äggvita", null, null, null, eggId, "äggvita", null)
        )

        val derived = table.getDerivedFrom(eggId)

        assertEquals(2, derived.size)
        assertTrue(derived.all { it.derivesFromId == eggId })
    }

    @Test
    fun `getDerivedFrom returns empty list when no derivations exist`() {
        val limeId = table.insert(
            LibraryIngredient(0, "lime", null, null, null, null, "lime", null)
        )

        val derived = table.getDerivedFrom(limeId)

        assertTrue(derived.isEmpty())
    }

    @Test
    fun `search finds ingredients by Swedish full name`() {
        table.insert(LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, "koriander", null, "malen", null, null, "koriander, malen", null))
        table.insert(LibraryIngredient(0, "lime", null, null, null, null, "lime", null))

        val results = table.search("koriander")

        assertEquals(2, results.size)
        assertTrue(results.all { it.fullNameSv.contains("koriander") })
    }

    @Test
    fun `search finds ingredients by base name`() {
        table.insert(LibraryIngredient(0, "koriander", null, "blad", null, null, "koriander, blad", null))
        table.insert(LibraryIngredient(0, "lime", null, null, null, null, "lime", null))

        val results = table.search("koriander")

        assertEquals(1, results.size)
        assertEquals("koriander", results[0].nameSv)
    }

    @Test
    fun `search finds ingredients by English name`() {
        table.insert(LibraryIngredient(0, "koriander", "coriander", null, null, null, "koriander", "coriander"))
        table.insert(LibraryIngredient(0, "lime", "lime", null, null, null, "lime", "lime"))

        val results = table.search("coriander")

        assertEquals(1, results.size)
        assertEquals("koriander", results[0].fullNameSv)
    }

    @Test
    fun `search returns empty list when no matches`() {
        table.insert(LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null))

        val results = table.search("xyz")

        assertTrue(results.isEmpty())
    }

    @Test
    fun `update modifies ingredient`() {
        val id = table.insert(
            LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null)
        )

        table.update(
            LibraryIngredient(id, "koriander", "coriander", "färsk", "fresh", null, "koriander, färsk", "fresh coriander")
        )

        val updated = table.getById(id)
        assertEquals("coriander", updated?.nameEn)
        assertEquals("färsk", updated?.qualifierSv)
        assertEquals("fresh", updated?.qualifierEn)
        assertEquals("koriander, färsk", updated?.fullNameSv)
        assertEquals("fresh coriander", updated?.fullNameEn)
    }

    @Test
    fun `delete removes ingredient`() {
        val id = table.insert(
            LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null)
        )

        table.delete(id)

        assertNull(table.getById(id))
    }

    @Test
    fun `delete non-existent id does not throw`() {
        assertDoesNotThrow {
            table.delete(999999L)
        }
    }

    @Test
    fun `getByName returns ingredient without qualifier`() {
        table.insert(LibraryIngredient(0, "koriander", null, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, "koriander", null, "malen", null, null, "koriander, malen", null))

        val found = table.getByName("koriander")

        assertNotNull(found)
        assertNull(found?.qualifierSv)
        assertEquals("koriander", found?.fullNameSv)
    }

    @Test
    fun `getByName returns null when name has qualifier`() {
        table.insert(LibraryIngredient(0, "koriander", null, "malen", null, null, "koriander, malen", null))

        val found = table.getByName("koriander")

        assertNull(found)
    }
}
