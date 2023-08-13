package app.mumsmums

import app.mumsmums.db.DynamoClientFactory
import app.mumsmums.db.RecipeTable
import app.mumsmums.identifiers.NumericIdGenerator
import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe

private val amazonDynamoDb = DynamoClientFactory.getDynamoDbForScriptContext()
private val table = RecipeTable(amazonDynamoDb)
private val idGenerator = NumericIdGenerator()

fun main() {
    table.put(recipe)
}

val recipe = Recipe(
        recipeId = idGenerator.generateId(),
        name = "Hasselbackspotatis med löjrom och smetana",
        servings = 6,
        numberOfUnits = 12,
        ingredientSections = listOf(
                IngredientSection(
                        null,
                        listOf(
                                Ingredient("potatis, små", "st", 12f),
                                Ingredient("löjrom", "gram", 60f),
                                Ingredient("gräslök, finhackad"),
                                Ingredient("frityrolja")
                        )
                ),
                IngredientSection(
                        "Koklag",
                        listOf(
                                Ingredient("vatten", "liter", 1f),
                                Ingredient("äppelcidervinäger", "deciliter", 2f),
                                Ingredient("salt", "deciliter", 0.75f)
                        ),
                )
        ),
        steps = listOf("Skiva potatisen fint nästan hela vägen igenom, använd antingen en träsked eller en handduk som " +
                "viks tre gånger från varje sida till en ”ränna” i mitten där potatisen läggs. Lägg potatisen direkt i " +
                "isvatten när du har skurit den.",
                "Koka upp vatten, vinäger och salt i en kastrull. Lägg ner potatisen och sjud i cirka 90 gradigt varmt " +
                        "vatten utan att det bubblar, 1 timme utan lock. Potatisen ska bli lite mjuk men inte genomkokt, " +
                        "halvrå. Den får inte koka och ska inte bli färdigkokt. Ta upp potatisen med hjälp av en hålslev " +
                        "och låt kallna i isvatten. Så här långt kan potatisen förberedas upp till 3 dagar före servering.",
                "Vid servering: Ta upp potatisarna ur vattnet och låt rinna av något. Fritera i absolut ren 140 grader " +
                        "varm frityrolja cirka 25–30 minuter tills potatisen är krispig rakt igenom. Men håll koll, " +
                        "det kan ta både kortare och längre tid. Det ska nästan sluta bubbla från potatisarna, då är de klara.",
                "Ta upp potatisen och låt rinna av på galler eller hushållspapper.",
                "Har tid kan du fortsätta tillaga de friterade potatisarna i ugn på 65 grader 1 timme, då blir de ännu " +
                        "krispigare. Potatisen kan stå i ugnen max 2 timmar. Har du ont om tid kan du hoppa över det här " +
                        "momentet.",
                "Servering: Toppa med smetana, löjrom, och gräslök. Servera direkt!"
        ),
        imageUrl = "https://lh3.googleusercontent.com/pw/AIL4fc-kYQJiAZyDNcrfzny0LEsQGv7Yw30kw28wpSiuokB5iUdPt9VPaByIfU7vkpnrMuwa1FBAoe6EGjQ2v89wpNb-KOkXVEDLumiBim-oE8HVcdrqH9VtJ_YCWKOFH2cfCHn0mc4CG-oebVUq21HrKOEqHQ=w1636-h2182-s-no?authuser=0",
)
