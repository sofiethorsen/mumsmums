package app.mumsmums

import app.mumsmums.db.SqliteRecipesDatabase
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        println("Usage: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:delete -- <recipeId>")
        println("Example: bazel run //src/scripts/jvmMain/kotlin/app/mumsmums:delete -- 123456")
        System.exit(1)
    }

    val recipeId = args[0].toLongOrNull() ?: run {
        println("Error: Invalid recipe ID. Must be a number.")
        exitProcess(1)
    }

    // Find project root
    val projectRoot = run {
        val currentDir = java.io.File(".").absoluteFile
        var root = currentDir
        while (root != null && !java.io.File(root, "MODULE.bazel").exists()) {
            root = root.parentFile
        }
        root ?: currentDir
    }

    val dbPath = "${projectRoot.absolutePath}/sqlite/recipes.db"
    val table = SqliteRecipesDatabase(dbPath)

    println("Deleting recipe with ID: $recipeId")
    table.delete(recipeId)

    println("Done!")
}
