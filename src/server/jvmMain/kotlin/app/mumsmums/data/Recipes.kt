package app.mumsmums.data

import app.mumsmums.model.Recipe

const val url = "https://lh3.googleusercontent.com/pw/AIL4fc-kYQJiAZyDNcrfzny0LEsQGv7Yw30kw28wpSiuokB5iUdPt9VPaByIfU7vkpnrMuwa1FBAoe6EGjQ2v89wpNb-KOkXVEDLumiBim-oE8HVcdrqH9VtJ_YCWKOFH2cfCHn0mc4CG-oebVUq21HrKOEqHQ=w1636-h2182-s-no?authuser=0"

private val one = Recipe(
        id = 1,
        name = "Hasselbackspotatis",
        ingredients = listOf(),
        instruction = "Skiva potatis och så",
        imageUrl = url
)

private val two = Recipe(
        id = 2,
        name = "Mumsmums",
        ingredients = listOf(),
        instruction = "Köp en mumsmums",
        imageUrl = url
)

private val three = Recipe(
        id = 3,
        name = "Mumsfilibaba",
        ingredients = listOf(),
        instruction = "Ät den bara",
        imageUrl = url
)

val recipes = listOf(one, two, three)
