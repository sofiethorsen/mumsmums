package app.mumsmums.db

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB
import com.amazonaws.services.dynamodbv2.document.Item
import com.amazonaws.services.dynamodbv2.document.PrimaryKey

// TODO: Use logger
open class MumsMumsTable<T>(private val amazonDynamoDB: AmazonDynamoDB, private val config: Config<T>) {
    protected val table = DynamoTable(amazonDynamoDB, config.tableName)
    private val mapper = Mapper()

    fun get(id: Long, consistentRead: Boolean = false): T? {
        return table.get(config.primaryKey(id), consistentRead)?.let { config.parse(it) }.also {
            println("GET ${config.tableName} id=$id")
        }
    }

    fun update(id: Long, value: T, fieldMask: Set<String>): T {
        val decoratedValue = config.decorator.decorate(value)
        val item = withFieldMask(config.toItem(decoratedValue), decoratedFieldMask(fieldMask, config.decorator.decoratedFields))
        val deletedAttributes = fieldMask.filterNot { attribute -> item.hasAttribute(attribute) }.toSet()
        val updateOutcome = table.updateItem(config.primaryKey(id), item, deletedAttributes)

        println("UPDATE ${config.tableName} id=$id")

        return config.parse(updateOutcome.item)
    }

    fun put(value: T): T {
        val decoratedValue = config.decorator.decorate(value)
        val item = config.toItem(decoratedValue)

        table.putItem(item)

        println("PUT ${config.tableName} id=${config.getId(decoratedValue)}")

        return decoratedValue
    }

    fun batchPut(values: List<T>) {
        val items = values.map { value -> config.toItem(config.decorator.decorate(value)) }
        table.putItems(items)

        println("BATCHPUT ${config.tableName} item count=${values.size}")
    }

    fun scan(): List<T> {
        val itemCollection = table.scan()
        // TODO: handle page sizes, one page is 1MB so not a problem with small amounts of data
        val iterator = itemCollection.firstPage().iterator()
        val values = mutableListOf<T>()
        while (iterator.hasNext()) {
            val item = iterator.next()
            values.add(config.parse(item))
        }

        println("SCAN ${config.tableName} item count=${values.size}")

        return values
    }

    private fun decoratedFieldMask(fieldMask: Set<String>, decoratedFields: Set<String>): Set<String> {
        return if (fieldMask.isEmpty()) { fieldMask } else { fieldMask + decoratedFields }
    }

    private fun withFieldMask(item: Item, fieldMask: Set<String>): Item {
        return Item.fromMap(
                item.attributes()
                        .filter { entry -> fieldMask.isEmpty() || fieldMask.contains(entry.key) }
                        .associate { entry -> entry.key to entry.value }
        )
    }

    companion object {
        data class Decorator<T>(val decorate: (T) -> T, val decoratedFields: Set<String>)

        data class Config<T>(
                val tableName: String,
                val getId: (T) -> Long,
                val primaryKey: (Long) -> PrimaryKey,
                val parse: (item: Item) -> T,
                val toItem: (value: T) -> Item,
                val decorator: Decorator<T>
        )
    }
}
