package app.mumsmums.filesystem

import app.mumsmums.constants.Constants.DB_PATH_RELATIVE
import java.io.File

object MumsMumsPaths {
    private val projectRoot = resolveProjectRoot()

    fun getDbPath(): String {
        // When running mumsmums locally in a Bazel context (not in docker), we want to ensure that we grab the db file
        // relative to the _Bazel_ workspace. If in docker, relative to the project root
        val workspaceDir = System.getenv("BUILD_WORKSPACE_DIRECTORY") ?: projectRoot.absolutePath
        return "${workspaceDir}/${DB_PATH_RELATIVE}"
    }

    fun getRecipeJsonPath(): String {
        return "${projectRoot}/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipe.json"
    }

    fun getRecipesJsonPath(): String {
        return "${projectRoot}/src/server/jvmMain/resources/recipes.json"
    }

    // Get image storage path from environment - in a Docker context, this will
    // be /app/images as per the docker-compose.yml configuration; however in local
    // dev, we'll simply default to a directory in the user's home folder.
    fun getImagePath(): String {
        return System.getenv("IMAGE_STORAGE_PATH")
            ?: "${System.getProperty("user.home")}/mumsmums-persist/images"
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
