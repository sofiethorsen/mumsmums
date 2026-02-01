package app.mumsmums.revalidation

import app.mumsmums.logging.getLoggerByClass
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class RevalidationRequest(val paths: List<String>)

private val logger = getLoggerByClass<RevalidationClient>()

/**
 * Client for triggering Next.js ISR revalidation.
 *
 * After recipe mutations (create, update, delete, image upload), this client
 * notifies the Next.js frontend to revalidate affected static pages.
 */
class RevalidationClient(
    private val frontendUrl: String
) {
    private val httpClient = HttpClient(CIO)
    private val json = Json { ignoreUnknownKeys = true }

    /**
     * Trigger revalidation of specific paths.
     *
     * @param paths List of paths to revalidate (e.g., ["/", "/recipe/123"])
     * @param jwtToken Valid JWT token for authentication
     */
    suspend fun revalidatePaths(paths: List<String>, jwtToken: String) {
        if (paths.isEmpty()) {
            logger.warn("No paths to revalidate")
            return
        }

        try {
            val response = httpClient.post("$frontendUrl/api/revalidate") {
                header("Authorization", "Bearer $jwtToken")
                contentType(ContentType.Application.Json)
                setBody(json.encodeToString(RevalidationRequest(paths)))
            }

            if (response.status.isSuccess()) {
                logger.info("Successfully triggered revalidation for paths: $paths")
            } else {
                logger.error("Revalidation request failed with status ${response.status}: ${response.bodyAsText()}")
            }
        } catch (e: Exception) {
            logger.error("Failed to trigger revalidation for paths: $paths", e)
            // Don't fail the main operation if revalidation fails
        }
    }

    /**
     * Trigger revalidation for homepage after any recipe mutation.
     */
    suspend fun revalidateHomepage(jwtToken: String) {
        revalidatePaths(listOf("/"), jwtToken)
    }

    /**
     * Trigger revalidation for homepage and specific recipe page.
     */
    suspend fun revalidateRecipe(recipeId: Long, jwtToken: String) {
        revalidatePaths(listOf("/", "/recipe/$recipeId"), jwtToken)
    }

    fun close() {
        httpClient.close()
    }
}
