package app.mumsmums.filesystem

import java.io.File

object MumsMumsPaths {
    private val projectRoot = resolveProjectRoot();

    fun getDbPath(): String {
        return "${projectRoot}/sqlite/recipes.db"
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
