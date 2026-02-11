#!/usr/bin/env bash

# Export recipes from SQLite database to JSON format

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
DB_PATH="$HOME"/mumsmums-persist/mumsmums.db
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
DB_PATH = os.path.join(os.path.expanduser("~"), "mumsmums-persist/mumsmums.db")
OUTPUT_FILE = os.path.join(GIT_DIR, "src/server/jvmMain/resources/recipes.json")
INGREDIENTS_FILE = os.path.join(GIT_DIR, "src/server/jvmMain/resources/ingredients.json")
UNITS_FILE = os.path.join(GIT_DIR, "src/server/jvmMain/resources/units.json")

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
            SELECT name, volume, quantity, recipeId as linkedRecipeId, ingredientId, unitId
            FROM ingredients
            WHERE sectionId = ?
            ORDER BY position
        """, (section_id,))

        ingredients = cursor.fetchall()

        for ing_row in ingredients:
            # Build ingredient dict with fields in alphabetical order
            ingredient = {}

            # ingredientId (optional, for library-linked ingredients)
            if ing_row['ingredientId'] is not None:
                ingredient['ingredientId'] = ing_row['ingredientId']

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

            # unitId (optional, for library-linked units)
            if ing_row['unitId'] is not None:
                ingredient['unitId'] = ing_row['unitId']

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

# Export ingredient library
cursor.execute("""
    SELECT id, name_sv, name_en, qualifier_sv, qualifier_en, derives_from_id, full_name_sv, full_name_en
    FROM ingredient_library
    ORDER BY id
""")

ingredients_library = []
for row in cursor.fetchall():
    ingredient = {'id': row['id']}
    if row['name_sv']:
        ingredient['nameSv'] = row['name_sv']
    if row['name_en']:
        ingredient['nameEn'] = row['name_en']
    if row['qualifier_sv']:
        ingredient['qualifierSv'] = row['qualifier_sv']
    if row['qualifier_en']:
        ingredient['qualifierEn'] = row['qualifier_en']
    if row['derives_from_id']:
        ingredient['derivesFromId'] = row['derives_from_id']
    if row['full_name_sv']:
        ingredient['fullNameSv'] = row['full_name_sv']
    if row['full_name_en']:
        ingredient['fullNameEn'] = row['full_name_en']
    ingredients_library.append(ingredient)

# Export unit library
cursor.execute("""
    SELECT id, short_name_sv, short_name_en, name_sv, name_en, type, ml_equivalent, g_equivalent
    FROM unit_library
    ORDER BY id
""")

units_library = []
for row in cursor.fetchall():
    unit = {'id': row['id']}
    if row['short_name_sv']:
        unit['shortNameSv'] = row['short_name_sv']
    if row['short_name_en']:
        unit['shortNameEn'] = row['short_name_en']
    if row['name_sv']:
        unit['nameSv'] = row['name_sv']
    if row['name_en']:
        unit['nameEn'] = row['name_en']
    if row['type']:
        unit['type'] = row['type']
    if row['ml_equivalent'] is not None:
        unit['mlEquivalent'] = row['ml_equivalent']
    if row['g_equivalent'] is not None:
        unit['gEquivalent'] = row['g_equivalent']
    units_library.append(unit)

conn.close()

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(recipes, f, indent=2, ensure_ascii=False)
    f.write('\n')  # Add trailing newline

with open(INGREDIENTS_FILE, 'w', encoding='utf-8') as f:
    json.dump(ingredients_library, f, indent=2, ensure_ascii=False)
    f.write('\n')

with open(UNITS_FILE, 'w', encoding='utf-8') as f:
    json.dump(units_library, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f"Exported {len(recipes)} recipes to {OUTPUT_FILE}")
print(f"Exported {len(ingredients_library)} ingredients to {INGREDIENTS_FILE}")
print(f"Exported {len(units_library)} units to {UNITS_FILE}")

PYTHON_SCRIPT

echo "Export complete!"
