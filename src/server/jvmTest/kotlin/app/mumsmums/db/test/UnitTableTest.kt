package app.mumsmums.db.test

import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.UnitTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.LibraryUnit
import app.mumsmums.model.UnitType
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.SQLException

class UnitTableTest {
    private val mockIdGenerator = mockk<NumericIdGenerator>()
    private lateinit var connection: DatabaseConnection
    private lateinit var table: UnitTable
    private var nextId = 1L

    @BeforeEach
    fun setUp() {
        connection = DatabaseConnection(":memory:")
        nextId = 1L
        every { mockIdGenerator.generateId() } answers { nextId++ }
        table = UnitTable(connection, mockIdGenerator)
    }

    @Test
    fun `insert creates a new unit and returns its id`() {
        val id = table.insert(
            LibraryUnit(
                id = 0,
                shortNameSv = "msk",
                shortNameEn = "tbsp",
                nameSv = "matsked",
                nameEn = "tablespoon",
                type = UnitType.VOLUME,
                mlEquivalent = 15f,
                gEquivalent = null
            )
        )

        assertTrue(id > 0)
        val found = table.getById(id)
        assertNotNull(found)
        assertEquals("msk", found?.shortNameSv)
        assertEquals("tbsp", found?.shortNameEn)
        assertEquals("matsked", found?.nameSv)
        assertEquals("tablespoon", found?.nameEn)
        assertEquals(UnitType.VOLUME, found?.type)
        assertEquals(15f, found?.mlEquivalent)
        assertNull(found?.gEquivalent)
    }

    @Test
    fun `insert with null optional fields works`() {
        val id = table.insert(
            LibraryUnit(
                id = 0,
                shortNameSv = "st",
                shortNameEn = null,
                nameSv = "stycken",
                nameEn = null,
                type = UnitType.COUNT,
                mlEquivalent = null,
                gEquivalent = null
            )
        )

        val found = table.getById(id)
        assertNotNull(found)
        assertNull(found?.shortNameEn)
        assertNull(found?.nameEn)
        assertNull(found?.mlEquivalent)
        assertNull(found?.gEquivalent)
    }

    @Test
    fun `insert weight unit with gEquivalent works`() {
        val id = table.insert(
            LibraryUnit(
                id = 0,
                shortNameSv = "kg",
                shortNameEn = "kg",
                nameSv = "kilogram",
                nameEn = "kilogram",
                type = UnitType.WEIGHT,
                mlEquivalent = null,
                gEquivalent = 1000f
            )
        )

        val found = table.getById(id)
        assertEquals(UnitType.WEIGHT, found?.type)
        assertEquals(1000f, found?.gEquivalent)
        assertNull(found?.mlEquivalent)
    }

    @Test
    fun `insert with duplicate shortNameSv throws exception`() {
        table.insert(
            LibraryUnit(0, "dl", "dl", "deciliter", "deciliter", UnitType.VOLUME, 100f, null)
        )

        assertThrows<SQLException> {
            table.insert(
                LibraryUnit(0, "dl", null, "deciliter variant", null, UnitType.VOLUME, 100f, null)
            )
        }
    }

    @Test
    fun `getById returns null for non-existent id`() {
        val found = table.getById(999999L)

        assertNull(found)
    }

    @Test
    fun `getAll returns all units sorted by Swedish name`() {
        table.insert(LibraryUnit(0, "msk", "tbsp", "matsked", "tablespoon", UnitType.VOLUME, 15f, null))
        table.insert(LibraryUnit(0, "dl", "dl", "deciliter", "deciliter", UnitType.VOLUME, 100f, null))
        table.insert(LibraryUnit(0, "g", "g", "gram", "gram", UnitType.WEIGHT, null, 1f))

        val all = table.getAll()

        assertEquals(3, all.size)
        assertEquals("deciliter", all[0].nameSv)
        assertEquals("gram", all[1].nameSv)
        assertEquals("matsked", all[2].nameSv)
    }

    @Test
    fun `getAll returns empty list when no units exist`() {
        val all = table.getAll()

        assertTrue(all.isEmpty())
    }

    @Test
    fun `update modifies unit`() {
        val id = table.insert(
            LibraryUnit(0, "tsk", null, "tesked", null, UnitType.VOLUME, 5f, null)
        )

        table.update(
            LibraryUnit(id, "tsk", "tsp", "tesked", "teaspoon", UnitType.VOLUME, 5f, null)
        )

        val updated = table.getById(id)
        assertEquals("tsp", updated?.shortNameEn)
        assertEquals("teaspoon", updated?.nameEn)
    }

    @Test
    fun `delete removes unit`() {
        val id = table.insert(
            LibraryUnit(0, "krm", "pinch", "kryddmått", "pinch", UnitType.VOLUME, 1f, null)
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
    fun `batchInsert creates multiple units`() {
        val units = listOf(
            LibraryUnit(0, "ml", "ml", "milliliter", "milliliter", UnitType.VOLUME, 1f, null),
            LibraryUnit(0, "cl", "cl", "centiliter", "centiliter", UnitType.VOLUME, 10f, null),
            LibraryUnit(0, "l", "l", "liter", "liter", UnitType.VOLUME, 1000f, null)
        )

        table.batchInsert(units)

        val all = table.getAll()
        assertEquals(3, all.size)
    }

    @Test
    fun `batchInsert ignores duplicates`() {
        table.insert(LibraryUnit(0, "g", "g", "gram", "gram", UnitType.WEIGHT, null, 1f))

        val units = listOf(
            LibraryUnit(0, "g", "g", "gram", "gram", UnitType.WEIGHT, null, 1f),  // duplicate
            LibraryUnit(0, "kg", "kg", "kilogram", "kilogram", UnitType.WEIGHT, null, 1000f)
        )

        table.batchInsert(units)

        val all = table.getAll()
        assertEquals(2, all.size)
    }

    @Test
    fun `all unit types can be stored and retrieved`() {
        table.insert(LibraryUnit(0, "dl", "dl", "deciliter", null, UnitType.VOLUME, 100f, null))
        table.insert(LibraryUnit(0, "g", "g", "gram", null, UnitType.WEIGHT, null, 1f))
        table.insert(LibraryUnit(0, "st", "pcs", "stycken", null, UnitType.COUNT, null, null))
        table.insert(LibraryUnit(0, "nypa", "pinch", "nypa", null, UnitType.OTHER, null, null))

        val all = table.getAll()

        assertEquals(4, all.size)
        assertTrue(all.any { it.type == UnitType.VOLUME })
        assertTrue(all.any { it.type == UnitType.WEIGHT })
        assertTrue(all.any { it.type == UnitType.COUNT })
        assertTrue(all.any { it.type == UnitType.OTHER })
    }
}
