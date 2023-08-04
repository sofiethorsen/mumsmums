package app.mumsmums.data

import app.mumsmums.model.Ingredient
import app.mumsmums.model.IngredientSection
import app.mumsmums.model.Recipe

private val one = Recipe(
        id = 1,
        name = "Hasselbackspotatis med löjrom och smetana",
        ingredientSections = listOf(
                IngredientSection(
                        null,
                        listOf(
                                Ingredient("potatis, små", "st", 12f),
                                Ingredient("löjrom", "gram", 60f),
                                Ingredient("gräslök, finhackad", null, null),
                                Ingredient("frityrolja", null, null)
                        )
                ),
                IngredientSection(
                        "Koklag",
                        listOf(
                                Ingredient("vatten", "liter", 1f),
                                Ingredient("äppelcidervinäger", "deciliter", 2f),
                                Ingredient("salt", "deciliter", 0.75f)
                        )
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
        imageUrl = "https://lh3.googleusercontent.com/pw/AIL4fc-kYQJiAZyDNcrfzny0LEsQGv7Yw30kw28wpSiuokB5iUdPt9VPaByIfU7vkpnrMuwa1FBAoe6EGjQ2v89wpNb-KOkXVEDLumiBim-oE8HVcdrqH9VtJ_YCWKOFH2cfCHn0mc4CG-oebVUq21HrKOEqHQ=w1636-h2182-s-no?authuser=0"
)

private val two = Recipe(
        id = 2,
        name = "Kanelbullar",
        ingredientSections = listOf(
                IngredientSection(
                        "Vetedeg",
                        listOf(
                                Ingredient("jäst", "gram", 30f),
                                Ingredient("mjölk", "gram", 250f),
                                Ingredient("vetemjöl", "gram", 570f),
                                Ingredient("salt", "tsk", 0.5f),
                                Ingredient("malen kardemumma", "gram", 5f),
                                Ingredient("strösocker", "gram", 90f),
                                Ingredient("ägg", "st", 1f),
                                Ingredient("smör", "gram", 250f),
                                Ingredient("ägg till pensling", "st", 1f),
                                Ingredient("pärlsocker", null, null),
                )),
                IngredientSection(
                        "Kanel och mandelfyllning",
                        listOf(
                                Ingredient("mandelmassa", "gram", 200f),
                                Ingredient("vaniljsocker", "gram", 10f),
                                Ingredient("malen kanel", "gram", 30f),
                                Ingredient("smör", "gram", 150f))
                ),
                IngredientSection(
                        "Sockerlag",
                        listOf(
                                Ingredient("vatten", "gram", 150f),
                                Ingredient("strösocker", "gram", 95f))
                ),
        ),
        steps = listOf(
                "Smula jästen i bunken till din matberedare. Värm mjölken till ljummen, slå över jästen och blanda runt.",
                "Lägg i resterande ingredienser förutom smöret. Kör ihop degen långsamt med krok. När degen gått ihop " +
                        "ökar du tempot lite och tillsätter smöret lite i taget. Kör degen 10 minuter i maskin tills den" +
                        " bildat gluten och känns elastisk, glansig och fin på ytan.",
                "Lägg ut degen på ett mjölat bord och låt vila 20 minuter.",
                "Blanda mandelmassa, vaniljsocker och kanel. Tillsätt smöret lite i taget tills du har en slät fyllning.",
                "Kavla ut degen 3-4 mm tjock, mer hög än bred då den ska vikas i mitten. Bred ut kanelfyllningen på den " +
                        "utkavlade degen och vik degen dubbelt, sporra ut remsor som du tvinnar till bullar. Lägg på " +
                        "plåt med bakplåtspapper. Vill du inte göra knutar då kavlar du ut degen 3-4 mm tjock, mer bred " +
                        "än hög och rulla ihop till en rulle. skiva till lagom stora bullar, lägg i formar. Låt jäsa " +
                        "till dubbel storlek, ca 1,5-2 timmar.",
                "Blanda under tiden samman vatten och socker i en kastrull och koka upp tills alla sockerkristaller har " +
                        "smält. Ställ åt sidan.",
                "Sätt ugnen på 190 grader varmluft. Pensla bullarna med ägg och strö över pärlsocker. Grädda i 9-11 " +
                        "minuter, dom ska få en fin gyllenbrun färg.",
                "Precis när bullarna kommit ut från ugnen penslar du dom med sockerlagen. Då får bullarna en fin glans " +
                        "och behåller saftigheten."
        ),
        imageUrl = "https://lh3.googleusercontent.com/pw/AIL4fc8gqv8oLcqwwjc6LAK9U0e5MuxySvdNdaEg9XnIpitEKnHX0LjC_TzIfaU1_gsZkg1N4dL7eHukzze786TSJEgCOR9P-VTTZEj8dWGENJQAJH5qUQ1kXBRS7iXoGtc0sBZaRdfHzHo4PqyVy1_F1FUOtQ=w3040-h2280-s-no?authuser=0"
)

private val three = Recipe(
        id = 3,
        name = "Råbiff",
        ingredientSections = listOf(
                IngredientSection(
                        null,
                        listOf(
                                Ingredient("oxfilé", "gram", 150f),
                                Ingredient("majonäs", "deciliter", 0.5f),
                                Ingredient("salt", null, null),
                        )),
        ),
        steps = listOf("Tärna oxfilén i lagom stora bitar, salta och peppra."),
        imageUrl = "https://lh3.googleusercontent.com/pw/AIL4fc-c2Cpr-fRxsHm47-Rv1xho5pwfGRsa51A-yEsEPdqg0T81ZQEeQxuvDB5dqbKOe2hfDQvE1YLzK773iLm8G6RWqdjkjLetd6o32VLxOFFGfVA7J9o1NDR2n5rpHJVHpWTPNag7KBGUydWt0Z-l3FBqsA=w1710-h2280-s-no?authuser=0"
)

private val four = Recipe(
        id = 4,
        name = "Amerikanska pannkakor med blåbär",
        ingredientSections = listOf(
                IngredientSection(
                        null,
                        listOf(
                                Ingredient("pannkaksmix", "gram", 150f),
                                Ingredient("ägg", "st", 1f),
                                Ingredient("mjölk", "deciliter", 1f),
                                Ingredient("yoghurt", "deciliter", 2f),
                                Ingredient("smör", "gram", 30f),
                                Ingredient("blåbär", "gram", 125f),
                                Ingredient("florsocker", null, null),
                                Ingredient("lönnsirap", null, null)
                        )),
        ),
        steps = listOf(
                "Smält smöret och låt svalna något.",
                "Separera äggulan och äggvitan, och blanda sedan äggula, mjölk och yoghurt i en skål",
                "Tillsätt det smälta smöret under vispning.",
                "Vispa äggvitan fluffig och vänd sedan ner i den andra blandningen",
                "Tillsätt pannkaksmixen och blanda försiktigt.",
                "Vänd ner ca 2/3 av blåbären i blandingen",
                "Värm en smör i en stekpanna på medelhög värme, och klicka ut smet, stek ca 2-3 minuter per sida",
                "Toppa med blåbär, pudra med florsocker och servera med lönnsirap."
        ),
        imageUrl = "https://lh3.googleusercontent.com/pw/AIL4fc9l_zHnFqiZsNKlf5BeT22XPKZcYb-oPu2ZGNc20Nom5dMq1e-LsghauLEtqisr4eVBmAnF_3gnx8O4-DBTEY0UGDDyyp7xhf8AHFLsLI5BpWEadipJLJyTnda5OaswvoXXzOhs6Nt9el5cfym-BuTkqw=w1732-h2310-s-no?authuser=0"
)

val recipes = listOf(one, two, three, four)
