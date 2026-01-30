package app.mumsmums.images.test

import app.mumsmums.db.RecipeRepository
import app.mumsmums.images.ImageUploadHandler
import app.mumsmums.images.ImageUploadResult
import app.mumsmums.model.Recipe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.io.File
import javax.imageio.ImageIO

class ImageUploadHandlerTest {
    private val mockRecipeRepository = mockk<RecipeRepository>()
    private lateinit var tempDir: File
    private lateinit var handler: ImageUploadHandler

    @BeforeEach
    fun setUp(@TempDir tempDir: File) {
        this.tempDir = tempDir
        // Create the recipes directory that ImageUploadHandler expects to exist
        val recipesDir = File(tempDir, "recipes")
        recipesDir.mkdirs()
        handler = ImageUploadHandler(mockRecipeRepository, tempDir.absolutePath)
    }

    @AfterEach
    fun tearDown() {
        // Clean up any created files
        tempDir.listFiles()?.forEach { it.deleteRecursively() }
    }

    private fun createTestImage(width: Int, height: Int): ByteArray {
        // Create a simple PNG image for testing
        // The ImageUploadHandler will validate it's WebP by content type, not by parsing
        val image = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
        val outputStream = ByteArrayOutputStream()
        ImageIO.write(image, "png", outputStream)
        return outputStream.toByteArray()
    }

    private fun createMockRecipe(recipeId: Long): Recipe {
        return Recipe(
            recipeId = recipeId,
            name = "Test Recipe",
            ingredientSections = emptyList(),
            steps = emptyList(),
            description = null,
            servings = null,
            numberOfUnits = null,
            imageUrl = null,
            version = 1L,
            createdAtInMillis = 1000L,
            lastUpdatedAtInMillis = 1000L
        )
    }

    @Test
    fun `uploadImage should succeed with valid WebP image`() {
        val recipeId = 123L
        val recipe = createMockRecipe(recipeId)
        val imageBytes = createTestImage(100, 100)

        every { mockRecipeRepository.getRecipeById(recipeId) } returns recipe
        every { mockRecipeRepository.updateRecipe(recipeId, any()) } returns Unit

        val result = handler.uploadImage(recipeId, imageBytes, "image/webp")

        assertTrue(result is ImageUploadResult.Success)
        assertEquals("/images/recipes/$recipeId.webp", (result as ImageUploadResult.Success).imageUrl)

        // Verify file was created
        val savedFile = File(tempDir, "recipes/$recipeId.webp")
        assertTrue(savedFile.exists())

        // Verify recipe was updated
        verify { mockRecipeRepository.updateRecipe(recipeId, match { it.imageUrl == "/images/recipes/$recipeId.webp" }) }
    }

    @Test
    fun `uploadImage should return RecipeNotFound when recipe does not exist`() {
        val recipeId = 999L
        val imageBytes = createTestImage(100, 100)

        every { mockRecipeRepository.getRecipeById(recipeId) } returns null

        val result = handler.uploadImage(recipeId, imageBytes, "image/webp")

        assertTrue(result is ImageUploadResult.RecipeNotFound)
        assertEquals(recipeId, (result as ImageUploadResult.RecipeNotFound).recipeId)
    }

    @Test
    fun `uploadImage should return FileTooLarge when file exceeds 5MB`() {
        val recipeId = 123L
        val recipe = createMockRecipe(recipeId)
        val largeImageBytes = ByteArray(6 * 1024 * 1024) // 6MB

        every { mockRecipeRepository.getRecipeById(recipeId) } returns recipe

        val result = handler.uploadImage(recipeId, largeImageBytes, "image/webp")

        assertTrue(result is ImageUploadResult.FileTooLarge)
        assertEquals(6 * 1024 * 1024, (result as ImageUploadResult.FileTooLarge).actualSize)
        assertEquals(5 * 1024 * 1024, result.maxSize)
    }

    @Test
    fun `uploadImage should return InvalidFormat when content type is not webp`() {
        val recipeId = 123L
        val recipe = createMockRecipe(recipeId)
        val imageBytes = createTestImage(100, 100)

        every { mockRecipeRepository.getRecipeById(recipeId) } returns recipe

        val result = handler.uploadImage(recipeId, imageBytes, "image/jpeg")

        assertTrue(result is ImageUploadResult.InvalidFormat)
        assertEquals("image/webp", (result as ImageUploadResult.InvalidFormat).expected)
        assertEquals("image/jpeg", result.actual)
    }

    @Test
    fun `uploadImage should overwrite existing image for the same recipe`() {
        val recipeId = 123L
        val recipe = createMockRecipe(recipeId)
        val firstImageBytes = createTestImage(100, 100)
        val secondImageBytes = createTestImage(100, 100)

        every { mockRecipeRepository.getRecipeById(recipeId) } returns recipe
        every { mockRecipeRepository.updateRecipe(recipeId, any()) } returns Unit

        // Upload first image
        handler.uploadImage(recipeId, firstImageBytes, "image/webp")

        val savedFile = File(tempDir, "recipes/$recipeId.webp")
        val firstFileSize = savedFile.length()

        // Upload second image
        val result = handler.uploadImage(recipeId, secondImageBytes, "image/webp")

        assertTrue(result is ImageUploadResult.Success)
        assertTrue(savedFile.exists())

        // File should still exist (overwritten)
        val secondFileSize = savedFile.length()
        assertTrue(secondFileSize > 0)
    }
}
