package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable
import kotlin.io.path.Path

fun main() {
    val home = System.getenv("HOME")
    val repoFolder = "Snapchat/Dev/mumsmums/src/scripts/jvmMain/kotlin/app/mumsmums/resources/recipes.json"
    val path = "$home/$repoFolder"

    val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
    val table = RecipeTable(amazonDynamoDb)
    val recipes = JsonParser.parseRecipes(Path(path))
    table.batchPut(recipes)
}
