package app.mumsmums.db

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.amazonaws.services.dynamodbv2.document.AttributeUpdate
import com.amazonaws.services.dynamodbv2.document.DynamoDB
import com.amazonaws.services.dynamodbv2.document.Item
import com.amazonaws.services.dynamodbv2.document.ItemCollection
import com.amazonaws.services.dynamodbv2.document.PrimaryKey
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome
import com.amazonaws.services.dynamodbv2.document.ScanOutcome
import com.amazonaws.services.dynamodbv2.document.TableWriteItems
import com.amazonaws.services.dynamodbv2.document.UpdateItemOutcome
import com.amazonaws.services.dynamodbv2.document.spec.GetItemSpec
import com.amazonaws.services.dynamodbv2.document.spec.UpdateItemSpec
import com.amazonaws.services.dynamodbv2.model.ReturnValue

open class DynamoTable(private val amazonDynamoDB: AmazonDynamoDB, private val tableName: String) {
    private val db = DynamoDB(amazonDynamoDB)
    private val table = db.getTable(tableName)
    private val dynamoDBBatchWriteLimit = 25

    fun get(key: PrimaryKey, consistentRead: Boolean = false): Item? {
        if (key.components.any { it.value.toString().isEmpty() }) {
            throw IllegalArgumentException("Tried to read from $tableName with invalid key: $key")
        }

        return if (consistentRead) {
            getConsistent(key)
        } else {
            table.getItem(key)
        }
    }

    private fun getConsistent(key: PrimaryKey): Item {
        val getItemSpec = GetItemSpec()
                .withPrimaryKey(key)
                .withConsistentRead(true)

        return table.getItem(getItemSpec)
    }

    fun putItem(item: Item): PutItemOutcome {
        return table.putItem(item)
    }

    fun putItems(items: List<Item>) {
        items.chunked(dynamoDBBatchWriteLimit).map { chunk ->
            val writeItems = TableWriteItems(tableName)
            chunk.forEach { writeItems.addItemToPut(it) }
            putItems(writeItems)
        }
    }

    private fun putItems(tableWriteItems: TableWriteItems) {
        var outcome = db.batchWriteItem(tableWriteItems)

        // need to query for unprocessed items until there are none left
        while (outcome.unprocessedItems.isNotEmpty()) {
            outcome = db.batchWriteItemUnprocessed(outcome.unprocessedItems)
        }
    }

    fun updateItem(primaryKey: PrimaryKey, item: Item, attributesToDelete: Set<String>): UpdateItemOutcome {
        val attributeBuilder = { key: String, value: Any -> AttributeUpdate(key).put(value) }
        val attributeUpdates = filterItemAttributes(primaryKey, item, attributeBuilder)
        val deleteAttributeUpdates = attributesToDelete.map { AttributeUpdate(it).delete() }
        val updateSpec = UpdateItemSpec()
                .withPrimaryKey(primaryKey)
                .withReturnValues(ReturnValue.ALL_NEW)
                .withAttributeUpdate(attributeUpdates + deleteAttributeUpdates)

        return table.updateItem(updateSpec)
    }

    fun updateItem(
            primaryKey: PrimaryKey,
            item: Item,
            conditionExpression: String,
            updateParameters: List<Pair<String, Any>> = emptyList(),
            attributesToDelete: Set<String> = emptySet(),
    ): UpdateItemOutcome {
        val attributeBuilder = { key: String, value: Any -> ":$key" to value }
        val valueMap = (filterItemAttributes(primaryKey, item, attributeBuilder) + updateParameters).toMap()
        val updateExpression = toUpdateExpression(primaryKey, item, attributesToDelete)
        val updateSpec = UpdateItemSpec()
                .withPrimaryKey(primaryKey)
                .withUpdateExpression(updateExpression)
                .withConditionExpression(conditionExpression)
                .withReturnValues(ReturnValue.ALL_NEW)
                .withValueMap(valueMap)

        return table.updateItem(updateSpec)
    }

    fun scan(): ItemCollection<ScanOutcome> {
        return table.scan()
    }

    private fun <T> filterItemAttributes(primaryKey: PrimaryKey, item: Item, buildFn: (String, Any) -> T): List<T> {
        return item.attributes()
                .filter { attribute -> !primaryKey.componentNameSet.contains(attribute.key) }
                .map { attribute -> buildFn(attribute.key, attribute.value) }
    }

    /**
     * Build an update expression based on the attributes of the Item, a string of the form:
     * SET <attribute1> =: <attribute1>, <attribute2> =: <attribute2> ...
     */
    private fun toUpdateExpression(primaryKey: PrimaryKey, item: Item, attributesToDelete: Set<String>): String {
        val buildFn: (String, Any) -> String = { key, _ -> "$key = :$key" }
        val expressionComponents = filterItemAttributes(primaryKey, item, buildFn)
        val setExpression = if (expressionComponents.isEmpty()) "" else expressionComponents.joinToString(prefix = "SET ", separator = ", ", postfix = "")
        val deleteExpression = if (attributesToDelete.isEmpty()) "" else attributesToDelete.joinToString(prefix = "REMOVE ", separator = ", ", postfix = "")
        val finalExpression = listOf(setExpression, deleteExpression).filterNot { it.isEmpty() }.joinToString(" ")
        if (finalExpression.isNotEmpty()) {
            return finalExpression
        } else {
            throw IllegalArgumentException("The update expression can not be empty.")
        }
    }
}
