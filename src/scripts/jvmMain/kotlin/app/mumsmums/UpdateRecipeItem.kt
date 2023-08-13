package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable

private val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
private val table = RecipeTable(amazonDynamoDb)
private val recipeId = 43982566760448L

fun main() {
    table.get(recipeId)?.let { original ->
        println(original)

        val updated = original.copy(name = "Test")
        val result = table.update(recipeId, updated, setOf("name"))

        println(result)
    }
}
