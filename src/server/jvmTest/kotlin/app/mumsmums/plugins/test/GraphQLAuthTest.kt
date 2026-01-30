package app.mumsmums.plugins.test

import app.mumsmums.auth.AuthHandler
import app.mumsmums.auth.JwtConfig
import app.mumsmums.auth.PasswordHasher
import app.mumsmums.db.DatabaseConnection
import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.RecipesTable
import app.mumsmums.db.UsersTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.plugins.configureAuth
import app.mumsmums.plugins.configureAuthRoutes
import app.mumsmums.plugins.configureGraphQL
import app.mumsmums.plugins.configureSerialization
import app.mumsmums.time.TimeProvider
import io.ktor.client.request.cookie
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import io.mockk.every
import io.mockk.mockk
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class GraphQLAuthTest {
    private val mockTimeProvider = mockk<TimeProvider>()
    private lateinit var connection: DatabaseConnection
    private lateinit var usersTable: UsersTable
    private lateinit var recipesTable: RecipesTable
    private lateinit var recipeRepository: RecipeRepository
    private lateinit var authHandler: AuthHandler
    private lateinit var jwtConfig: JwtConfig

    @BeforeEach
    fun setUp(@TempDir tempDir: File) {
        connection = DatabaseConnection(":memory:")
        usersTable = UsersTable(connection, mockTimeProvider)
        val idGenerator = NumericIdGenerator()
        recipesTable = RecipesTable(connection, idGenerator)
        // Create recipes directory for image deletion tests
        File(tempDir, "recipes").mkdirs()
        recipeRepository = RecipeRepository(recipesTable, idGenerator, tempDir.absolutePath)
        authHandler = AuthHandler(usersTable)

        every { mockTimeProvider.currentTimeMillis() } returns 1000000L

        jwtConfig = JwtConfig(
            secret = JwtConfig.Secret("test-secret-key-for-testing-only"),
            issuer = JwtConfig.Issuer("mumsmums-test"),
            audience = JwtConfig.Audience("mumsmums-test-audience")
        )

        // Create a test user
        val passwordHash = PasswordHasher.hash("testpassword")
        usersTable.createUser("test@example.com", passwordHash)
    }

    @Test
    fun `When querying recipes without authentication, it should succeed`() = testApplication {
        application {
            configureSerialization()
            configureAuth(jwtConfig)
            configureAuthRoutes(authHandler, jwtConfig, secureCookies = false)
            configureGraphQL(recipeRepository, jwtConfig)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                  "query": "query { recipes { recipeId name } }"
                }
            """.trimIndent())
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("\"data\""))
    }

    @Test
    fun `When creating recipe without authentication, it should fail`() = testApplication {
        application {
            configureSerialization()
            configureAuth(jwtConfig)
            configureAuthRoutes(authHandler, jwtConfig, secureCookies = false)
            configureGraphQL(recipeRepository, jwtConfig)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                  "query": "mutation(${'$'}input: RecipeInput!) { createRecipe(input: ${'$'}input) { recipeId name } }",
                  "variables": {
                    "input": {
                      "name": "Test Recipe",
                      "ingredientSections": [],
                      "steps": ["Step 1"]
                    }
                  }
                }
            """.trimIndent())
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val json = Json.parseToJsonElement(body).jsonObject

        assertTrue(json.containsKey("errors"))
        val errorMessage = json["errors"]?.toString() ?: ""
        assertTrue(errorMessage.contains("Authentication required"))
    }

    @Test
    fun `When creating recipe with valid authentication, it should succeed`() = testApplication {
        application {
            configureSerialization()
            configureAuth(jwtConfig)
            configureAuthRoutes(authHandler, jwtConfig, secureCookies = false)
            configureGraphQL(recipeRepository, jwtConfig)
        }

        // First, login to get auth token
        val loginResponse = client.post("/api/auth/login") {
            contentType(ContentType.Application.Json)
            setBody("""{"email":"test@example.com","password":"testpassword"}""")
        }

        assertEquals(HttpStatusCode.OK, loginResponse.status)
        val authToken = loginResponse.headers["Set-Cookie"]
            ?.split(";")
            ?.first()
            ?.split("=")
            ?.last()
        assertNotNull(authToken)

        // Now try to create a recipe with the token
        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            cookie("auth_token", authToken!!)
            setBody("""
                {
                  "query": "mutation(${'$'}input: RecipeInput!) { createRecipe(input: ${'$'}input) { recipeId name } }",
                  "variables": {
                    "input": {
                      "name": "Test Recipe",
                      "ingredientSections": [],
                      "steps": ["Step 1"]
                    }
                  }
                }
            """.trimIndent())
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val json = Json.parseToJsonElement(body).jsonObject

        assertTrue(json.containsKey("data"))
        assertFalse(json.containsKey("errors"))
        val recipeName = json["data"]?.jsonObject?.get("createRecipe")?.jsonObject?.get("name")?.jsonPrimitive?.content
        assertEquals("Test Recipe", recipeName)
    }

    @Test
    fun `When updating recipe without authentication, it should fail`() = testApplication {
        application {
            configureSerialization()
            configureAuth(jwtConfig)
            configureAuthRoutes(authHandler, jwtConfig, secureCookies = false)
            configureGraphQL(recipeRepository, jwtConfig)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                  "query": "mutation(${'$'}recipeId: Long!, ${'$'}input: RecipeInput!) { updateRecipe(recipeId: ${'$'}recipeId, input: ${'$'}input) { recipeId name } }",
                  "variables": {
                    "recipeId": 1,
                    "input": {
                      "name": "Updated Recipe",
                      "ingredientSections": [],
                      "steps": ["Step 1"]
                    }
                  }
                }
            """.trimIndent())
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val json = Json.parseToJsonElement(body).jsonObject

        assertTrue(json.containsKey("errors"))
        val errorMessage = json["errors"]?.toString() ?: ""
        assertTrue(errorMessage.contains("Authentication required"))
    }

    @Test
    fun `When deleting recipe without authentication, it should fail`() = testApplication {
        application {
            configureSerialization()
            configureAuth(jwtConfig)
            configureAuthRoutes(authHandler, jwtConfig, secureCookies = false)
            configureGraphQL(recipeRepository, jwtConfig)
        }

        val response = client.post("/graphql") {
            contentType(ContentType.Application.Json)
            setBody("""
                {
                  "query": "mutation(${'$'}recipeId: Long!) { deleteRecipe(recipeId: ${'$'}recipeId) }",
                  "variables": {
                    "recipeId": 1
                  }
                }
            """.trimIndent())
        }

        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        val json = Json.parseToJsonElement(body).jsonObject

        assertTrue(json.containsKey("errors"))
        val errorMessage = json["errors"]?.toString() ?: ""
        assertTrue(errorMessage.contains("Authentication required"))
    }
}
