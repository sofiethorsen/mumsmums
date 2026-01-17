#!/usr/bin/env bash

# Export recipes from SQLite database to JSON format

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
DB_PATH="$GIT_DIR/sqlite/mumsmums.db"
OUTPUT_FILE="$GIT_DIR/src/server/jvmMain/resources/recipes.json"

if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found: $DB_PATH"
    exit 1
fi

echo "Exporting recipes from $DB_PATH to $OUTPUT_FILE..."

python3 << 'PYTHON_SCRIPT'
import sqlite3
import json
import sys
import os

# Get paths from environment
GIT_DIR = os.popen('git rev-parse --show-toplevel').read().strip()
DB_PATH = os.path.join(GIT_DIR, "sqlite/mumsmums.db")
OUTPUT_FILE = os.path.join(GIT_DIR, "src/server/jvmMain/resources/recipes.json")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Get all recipes
cursor.execute("""
    SELECT recipeId, name, description, servings, numberOfUnits, imageUrl
    FROM recipes
    ORDER BY recipeId
""")

recipes = []

for recipe_row in cursor.fetchall():
    recipe_id = recipe_row['recipeId']

    # Build recipe dict with fields in alphabetical order
    recipe = {}

    # Add description first (alphabetically)
    if recipe_row['description'] is not None:
        recipe['description'] = recipe_row['description']

    # Add imageUrl
    if recipe_row['imageUrl'] is not None:
        recipe['imageUrl'] = recipe_row['imageUrl']

    # Add ingredientSections (will be populated below)
    recipe['ingredientSections'] = []

    # Get ingredient sections for this recipe
    cursor.execute("""
        SELECT id, name, position
        FROM ingredient_sections
        WHERE recipeId = ?
        ORDER BY position
    """, (recipe_id,))

    sections = cursor.fetchall()

    for section_row in sections:
        section_id = section_row['id']

        # Build section dict with fields in alphabetical order
        section = {}
        section['ingredients'] = []

        # Get ingredients for this section
        cursor.execute("""
            SELECT name, volume, quantity, recipeId as linkedRecipeId
            FROM ingredients
            WHERE sectionId = ?
            ORDER BY position
        """, (section_id,))

        ingredients = cursor.fetchall()

        for ing_row in ingredients:
            # Build ingredient dict with fields in alphabetical order: name, quantity, recipeId, volume
            ingredient = {}

            # name (always present)
            ingredient['name'] = ing_row['name']

            # quantity (optional)
            if ing_row['quantity'] is not None:
                qty = ing_row['quantity']
                # Format quantity: whole numbers without decimals, otherwise max 3 decimals
                if qty == int(qty):
                    ingredient['quantity'] = int(qty)
                else:
                    ingredient['quantity'] = round(qty, 3)

            # recipeId (optional, for linked recipes)
            if ing_row['linkedRecipeId'] is not None:
                ingredient['recipeId'] = ing_row['linkedRecipeId']

            # volume (optional)
            if ing_row['volume'] is not None:
                ingredient['volume'] = ing_row['volume']

            section['ingredients'].append(ingredient)

        # name comes after ingredients alphabetically
        section['name'] = section_row['name']

        recipe['ingredientSections'].append(section)

    # Add name
    recipe['name'] = recipe_row['name']

    # Add numberOfUnits
    recipe['numberOfUnits'] = recipe_row['numberOfUnits']

    # Add recipeId
    recipe['recipeId'] = recipe_id

    # Add servings
    recipe['servings'] = recipe_row['servings']

    # Get steps for this recipe
    cursor.execute("""
        SELECT step
        FROM recipe_steps
        WHERE recipeId = ?
        ORDER BY position
    """, (recipe_id,))

    steps = cursor.fetchall()
    recipe['steps'] = [step_row['step'] for step_row in steps]

    recipes.append(recipe)

conn.close()

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(recipes, f, indent=2, ensure_ascii=False)
    f.write('\n')  # Add trailing newline

print(f"Exported {len(recipes)} recipes to {OUTPUT_FILE}")

PYTHON_SCRIPT

echo "Export complete!"
