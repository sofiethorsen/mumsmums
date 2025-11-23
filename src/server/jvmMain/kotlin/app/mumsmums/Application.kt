package app.mumsmums

import app.mumsmums.db.RecipeRepository
import app.mumsmums.db.SqliteRecipeTable
import app.mumsmums.plugins.configureCORS
import app.mumsmums.plugins.configureGraphQL
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    // Use environment variable or resolve to project root
    val dbPath = System.getenv("SQLITE_DB_PATH") ?: run {
        // Try to find project root by looking for MODULE.bazel
        val currentDir = java.io.File(".").absoluteFile
        var projectRoot = currentDir
        while (projectRoot != null && !java.io.File(projectRoot, "MODULE.bazel").exists()) {
            projectRoot = projectRoot.parentFile
        }
        val resolvedRoot = projectRoot ?: currentDir
        "${resolvedRoot.absolutePath}/sqlite/recipes.db"
    }

    println("Using database path: $dbPath")
    val recipeTable = SqliteRecipeTable(dbPath)
    val recipeRepository = RecipeRepository(recipeTable)

    configureGraphQL(recipeRepository)
    configureCORS()
}
