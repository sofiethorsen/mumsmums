package app.mumsmums.model

/**
 * A recipe that hasn't been persisted yet — has no ID.
 * Use [RecipesTable.insert] to persist and get back a full [Recipe] with a generated ID.
 */
data class NewRecipe(
        val name: String,
        val ingredientSections: List<IngredientSection>,
        val steps: List<String>,
        val description: String? = null,
        val servings: Int? = null,
        val numberOfUnits: Int? = null,
        val imageUrl: String? = null,
        val version: Long = 0L,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
) {
    fun toRecipe(recipeId: Long) = Recipe(
        recipeId = recipeId,
        name = name,
        ingredientSections = ingredientSections,
        steps = steps,
        description = description,
        servings = servings,
        numberOfUnits = numberOfUnits,
        imageUrl = imageUrl,
        version = version,
        createdAtInMillis = createdAtInMillis,
        lastUpdatedAtInMillis = lastUpdatedAtInMillis,
    )
}
