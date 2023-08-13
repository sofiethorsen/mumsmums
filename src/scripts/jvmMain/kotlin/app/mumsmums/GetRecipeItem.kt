package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable

fun main() {
    val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
    val table = RecipeTable(amazonDynamoDb)
    val id = 43982566760448L

    val recipe = table.get(id)

    println(recipe)
}
