package app.mumsmums.model

/**
 * A recipe that hasn't been persisted yet — has no ID.
 * Use [RecipesTable.insert] to persist and get back a full [Recipe] with a generated ID.
 */
data class NewRecipe(
        val nameSv: String,
        val ingredientSections: List<IngredientSection>,
        val stepsSv: List<String>,
        val nameEn: String? = null,
        val stepsEn: List<String> = emptyList(),
        val descriptionSv: String? = null,
        val descriptionEn: String? = null,
        val servings: Int? = null,
        val numberOfUnits: Int? = null,
        val imageUrl: String? = null,
        val version: Long = 0L,
        val createdAtInMillis: Long = 0L,
        val lastUpdatedAtInMillis: Long = 0L,
) {
    fun toRecipe(recipeId: Long) = Recipe(
        recipeId = recipeId,
        nameSv = nameSv,
        nameEn = nameEn,
        ingredientSections = ingredientSections,
        stepsSv = stepsSv,
        stepsEn = stepsEn,
        descriptionSv = descriptionSv,
        descriptionEn = descriptionEn,
        servings = servings,
        numberOfUnits = numberOfUnits,
        imageUrl = imageUrl,
        version = version,
        createdAtInMillis = createdAtInMillis,
        lastUpdatedAtInMillis = lastUpdatedAtInMillis,
    )
}
