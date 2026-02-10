package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.IngredientBaseTable
import app.mumsmums.db.IngredientLibraryTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.IngredientBase
import app.mumsmums.model.LibraryIngredient
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class IngredientLibraryTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var connection: DatabaseConnection
    private lateinit var baseTable: IngredientBaseTable
    private lateinit var table: IngredientLibraryTable
    private var korianderBaseId: Long = 0
    private var limeBaseId: Long = 0
    private var nextId = 1L

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        nextId = 1L
        every { mockIdGenerator.generateId() } answers { nextId++ }
        baseTable = IngredientBaseTable(connection, mockIdGenerator)
        table = IngredientLibraryTable(connection, mockIdGenerator)

        // Create base ingredients for tests
        korianderBaseId = baseTable.insert(IngredientBase(0, "koriander", "coriander"))
        limeBaseId = baseTable.insert(IngredientBase(0, "lime", "lime"))
    }

    @Test
    fun `insert creates a new library ingredient and returns its id`() {
        val id = table.insert(
            LibraryIngredient(
                id = 0,
                baseId = korianderBaseId,
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
        assertEquals(korianderBaseId, found?.baseId)
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
                baseId = limeBaseId,
                qualifierSv = null,
                qualifierEn = null,
                derivesFromId = null,
                fullNameSv = "lime",
                fullNameEn = null
            )
        )

        val found = table.getById(id)
        assertNotNull(found)
        assertNull(found?.qualifierSv)
        assertNull(found?.qualifierEn)
        assertNull(found?.fullNameEn)
    }

    @Test
    fun `insert with derivesFromId creates derivation relationship`() {
        val limeId = table.insert(
            LibraryIngredient(0, limeBaseId, null, null, null, "lime", "lime")
        )
        val limeJuiceId = table.insert(
            LibraryIngredient(0, limeBaseId, "juice", "juice", limeId, "limejuice", "lime juice")
        )

        val limeJuice = table.getById(limeJuiceId)
        assertEquals(limeId, limeJuice?.derivesFromId)
    }

    @Test
    fun `insert with duplicate fullNameSv throws exception`() {
        table.insert(
            LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null)
        )

        assertThrows<SQLException> {
            table.insert(
                LibraryIngredient(0, korianderBaseId, "färsk", null, null, "koriander", null)
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
        table.insert(LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, limeBaseId, null, null, null, "lime", null))
        table.insert(LibraryIngredient(0, korianderBaseId, "malen", null, null, "koriander, malen", null))

        val all = table.getAll()

        assertEquals(3, all.size)
        assertEquals("koriander", all[0].fullNameSv)
        assertEquals("koriander, malen", all[1].fullNameSv)
        assertEquals("lime", all[2].fullNameSv)
    }

    @Test
    fun `getByBaseId returns all ingredients with given base`() {
        table.insert(LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, korianderBaseId, "malen", null, null, "koriander, malen", null))
        table.insert(LibraryIngredient(0, limeBaseId, null, null, null, "lime", null))

        val korianderIngredients = table.getByBaseId(korianderBaseId)

        assertEquals(2, korianderIngredients.size)
        assertTrue(korianderIngredients.all { it.baseId == korianderBaseId })
    }

    @Test
    fun `getByBaseId returns empty list when no ingredients have base`() {
        val results = table.getByBaseId(999999L)

        assertTrue(results.isEmpty())
    }

    @Test
    fun `getDerivedFrom returns all ingredients derived from given ingredient`() {
        val limeId = table.insert(
            LibraryIngredient(0, limeBaseId, null, null, null, "lime", null)
        )
        table.insert(
            LibraryIngredient(0, limeBaseId, "juice", null, limeId, "limejuice", null)
        )
        table.insert(
            LibraryIngredient(0, limeBaseId, "skal", null, limeId, "limeskal", null)
        )

        val derived = table.getDerivedFrom(limeId)

        assertEquals(2, derived.size)
        assertTrue(derived.all { it.derivesFromId == limeId })
    }

    @Test
    fun `getDerivedFrom returns empty list when no derivations exist`() {
        val limeId = table.insert(
            LibraryIngredient(0, limeBaseId, null, null, null, "lime", null)
        )

        val derived = table.getDerivedFrom(limeId)

        assertTrue(derived.isEmpty())
    }

    @Test
    fun `search finds ingredients by Swedish name`() {
        table.insert(LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null))
        table.insert(LibraryIngredient(0, korianderBaseId, "malen", null, null, "koriander, malen", null))
        table.insert(LibraryIngredient(0, limeBaseId, null, null, null, "lime", null))

        val results = table.search("koriander")

        assertEquals(2, results.size)
        assertTrue(results.all { it.fullNameSv.contains("koriander") })
    }

    @Test
    fun `search finds ingredients by English name`() {
        table.insert(LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", "coriander"))
        table.insert(LibraryIngredient(0, limeBaseId, null, null, null, "lime", "lime"))

        val results = table.search("coriander")

        assertEquals(1, results.size)
        assertEquals("koriander", results[0].fullNameSv)
    }

    @Test
    fun `search returns empty list when no matches`() {
        table.insert(LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null))

        val results = table.search("xyz")

        assertTrue(results.isEmpty())
    }

    @Test
    fun `update modifies library ingredient`() {
        val id = table.insert(
            LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null)
        )

        table.update(
            LibraryIngredient(id, korianderBaseId, "färsk", "fresh", null, "koriander, färsk", "fresh coriander")
        )

        val updated = table.getById(id)
        assertEquals("färsk", updated?.qualifierSv)
        assertEquals("fresh", updated?.qualifierEn)
        assertEquals("koriander, färsk", updated?.fullNameSv)
        assertEquals("fresh coriander", updated?.fullNameEn)
    }

    @Test
    fun `delete removes library ingredient`() {
        val id = table.insert(
            LibraryIngredient(0, korianderBaseId, null, null, null, "koriander", null)
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
}
