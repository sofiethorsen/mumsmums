package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable

private val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
private val table = RecipeTable(amazonDynamoDb)
private val recipeId = 43998781233152

fun main() {
    table.get(recipeId)?.let { original ->
        println(original)

        val updated = original.copy(
                fbPreviewImageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/43998781233152/1200-600.webp",
                imageUrl = "https://dmdqeeh0foqsn.cloudfront.net/assets/43998781233152/300-300.webp",
        )
        val result = table.update(recipeId, updated, setOf("fbPreviewImageUrl", "imageUrl"))

        println(result)
    }
}
