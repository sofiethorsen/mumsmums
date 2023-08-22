package app.mumsmums.db

import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe
import com.amazonaws.services.dynamodbv2.document.Item
import com.amazonaws.services.dynamodbv2.document.ItemUtils
import com.amazonaws.services.dynamodbv2.model.AttributeValue
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class Mapper {
    private val formatter = Json {
        prettyPrint = false
        isLenient = true
        ignoreUnknownKeys = true
    }

    fun toItem(recipe: Recipe): Item {
        val attributeMap = mutableMapOf<String, AttributeValue>()

        attributeMap["recipeId"] = toAttributeValueFromLong(recipe.recipeId)
        attributeMap["name"] = toAttributeValueFromString(recipe.name)
        if (recipe.servings != null) {
            attributeMap["servings"] = toAttributeValueFromInt(recipe.servings as Int)
        }
        if (recipe.numberOfUnits != null) {
            attributeMap["numberOfUnits"] = toAttributeValueFromInt(recipe.numberOfUnits as Int)
        }

        val stringSections = formatter.encodeToString(recipe.ingredientSections)
        attributeMap["ingredientSections"] = toAttributeValueFromString(stringSections)

        val stringSteps = formatter.encodeToString(recipe.steps)
        attributeMap["steps"] = toAttributeValueFromString(stringSteps)

        if (recipe.imageUrl != null) {
            attributeMap["imageUrl"] = toAttributeValueFromString(recipe.imageUrl as String)
        }

        attributeMap["version"] = toAttributeValueFromLong(recipe.version)
        attributeMap["createdAtInMillis"] = toAttributeValueFromLong(recipe.createdAtInMillis)
        attributeMap["lastUpdatedAtInMillis"] = toAttributeValueFromLong(recipe.lastUpdatedAtInMillis)

        return ItemUtils.toItem(attributeMap)
    }

    fun toRecipe(item: Item): Recipe {
        val id = item.getLong("recipeId")
        val name = item.getString("name")
        val servings = if (item.hasAttribute("servings")) item.getNumber("servings").toInt() else null
        val numberOfUnits = if (item.hasAttribute("numberOfUnits")) item.getNumber("numberOfUnits").toInt() else null
        val ingredientSections: List<IngredientSection> = formatter.decodeFromString(item.getString("ingredientSections"))
        val steps: List<String> = formatter.decodeFromString(item.getString("steps"))
        val imageUrl = if (item.hasAttribute("imageUrl")) item.getString("imageUrl") else null
        val version = item.getLong("version")
        val createdAtInMillis = item.getLong("createdAtInMillis")
        val lastUpdatedAtInMillis = item.getLong("lastUpdatedAtInMillis")

        return Recipe(id, name, servings, numberOfUnits, ingredientSections, steps, imageUrl, version, createdAtInMillis, lastUpdatedAtInMillis)
    }

    private fun toAttributeValueFromLong(value: Long): AttributeValue {
        val attributeValue = AttributeValue()
        attributeValue.n = value.toString()
        return attributeValue
    }

    private fun toAttributeValueFromInt(value: Int): AttributeValue {
        val attributeValue = AttributeValue()
        attributeValue.n = value.toString()
        return attributeValue
    }

    private fun toAttributeValueFromString(value: String): AttributeValue {
        val attributeValue = AttributeValue()
        attributeValue.s = value
        return attributeValue
    }

    private fun toAttributeValueFromStringList(value: List<String>): AttributeValue {
        val attributeValue = AttributeValue()
        attributeValue.setSS(value)
        return attributeValue
    }
}
