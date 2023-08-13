package app.mumsmums.db

import app.mumsmums.model.Recipe
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.amazonaws.services.dynamodbv2.document.Item
import com.amazonaws.services.dynamodbv2.document.PrimaryKey
import java.time.Instant

class RecipeTable(amazonDynamoDB: AmazonDynamoDB) : MumsMumsTable<Recipe>(amazonDynamoDB, config) {

    companion object {
        private const val tableName = "RecipeTable"
        private val mapper = Mapper()
        private val getIdFn = { recipe: Recipe -> recipe.recipeId }
        private val primaryKeyFn = { id: Long -> PrimaryKey().addComponent("recipeId", id) }
        private val parseFn = { item: Item -> mapper.toRecipe(item) }
        private val toItemFn = { value: Recipe -> mapper.toItem(value) }
        private val decorate: (Recipe) -> Recipe = { recipe: Recipe ->
            val timestamp = Instant.now().toEpochMilli()
            val createdAt = if (recipe.createdAtInMillis == 0L) timestamp else recipe.createdAtInMillis
            val updated = recipe.copy(
                    version = recipe.version + 1,
                    createdAtInMillis = createdAt,
                    lastUpdatedAtInMillis = timestamp
            )
            updated
        }
        private val decoratedFields = setOf("version", "createdAtInMillis", "lastUpdatedAtInMillis")
        private val decorator = MumsMumsTable.Companion.Decorator(decorate, decoratedFields)

        private val config = MumsMumsTable.Companion.Config(
                tableName,
                getIdFn,
                primaryKeyFn,
                parseFn,
                toItemFn,
                decorator
        )
    }
}
