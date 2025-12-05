package app.mumsmums.filesystem

import java.io.File

private const val DB_PATH_ENV_VAR = "MUMSMUMS_DB_PATH"

object MumsMumsPaths {
    private val projectRoot = resolveProjectRoot();

    fun getDbPath(): String {
        // The db path env var should always be set
        val relativePath = System.getenv(DB_PATH_ENV_VAR) ?: throw IllegalStateException("$DB_PATH_ENV_VAR not set")

        // When running mumsmums locally in a Bazel context (not in docker), we want to ensure that we grab the db file
        // relative to the _Bazel_ workspace. If in docker, relative to the project root
        val workspaceDir = System.getenv("BUILD_WORKSPACE_DIRECTORY") ?: projectRoot.absolutePath
        return "${workspaceDir}/${relativePath}"
    }

    fun getRecipeJsonPath(): String {
        return "${projectRoot}/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipe.json"
    }

    fun getRecipesJsonPath(): String {
        return "${projectRoot}/src/server/jvmMain/resources/recipes.json"
    }

    /**
     * Resolves the project root directory by looking for the presence of "MODULE.bazel" file.
     * If not found, returns the current working directory.
     */
    private fun resolveProjectRoot(): File {
        val currentDirectory = File(".").absoluteFile
        var root = currentDirectory

        // Try to traverse up the directory tree to find MODULE.bazel
        while (root != null && !File(root, "MODULE.bazel").exists()) {
            root = root.parentFile
        }

        return root ?: currentDirectory
    }
}
