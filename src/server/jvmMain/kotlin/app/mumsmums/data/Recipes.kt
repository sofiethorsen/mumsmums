package app.mumsmums.data

import app.mumsmums.model.Recipe

private val one = Recipe(
        name = "Kärleksmums",
        ingredients = listOf(),
        instruction = "Foo bar baz",
)

private val two = Recipe(
        name = "Mumsmums",
        ingredients = listOf(),
        instruction = "Foo bar baz",
)

private val three = Recipe(
        name = "Mumsfilibaba",
        ingredients = listOf(),
        instruction = "Foo bar baz",
)

val recipes = listOf(one, two, three)
