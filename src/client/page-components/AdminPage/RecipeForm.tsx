import React, { useEffect, useState } from 'react'
import styles from './AdminPage.module.css'
import { GetRecipeByIdQuery } from '../../graphql/generated'
import ImageUpload from '../../components/ImageUpload/ImageUpload'

// Use the query result type - we only need the fields the form actually uses
type RecipeDetails = NonNullable<GetRecipeByIdQuery['recipe']>

export interface RecipeInput {
    name: string
    description: string | null
    servings: number | null
    numberOfUnits: number | null
    imageUrl: string | null
    ingredientSections: {
        name: string | null
        ingredients: {
            name: string
            volume: string | null
            quantity: number | null
            recipeId: number | null
        }[]
    }[]
    steps: string[]
}

interface RecipeFormProps {
    recipe?: RecipeDetails | null
    onSubmit: (recipeInput: RecipeInput) => void
    onCancel: () => void
}

interface IngredientInput {
    name: string
    volume: string
    quantity: string
    recipeId: string
}

interface IngredientSectionInput {
    name: string
    ingredients: IngredientInput[]
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onSubmit, onCancel }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [servings, setServings] = useState('')
    const [numberOfUnits, setNumberOfUnits] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [ingredientSections, setIngredientSections] = useState<IngredientSectionInput[]>([
        { name: '', ingredients: [{ name: '', volume: '', quantity: '', recipeId: '' }] },
    ])
    const [steps, setSteps] = useState<string[]>([''])

    useEffect(() => {
        if (recipe) {
            setName(recipe.name)
            setDescription(recipe.description || '')
            setServings(recipe.servings?.toString() || '')
            setNumberOfUnits(recipe.numberOfUnits?.toString() || '')
            setImageUrl(recipe.imageUrl || '')
            setIngredientSections(
                recipe.ingredientSections.map((section) => ({
                    name: section.name || '',
                    ingredients: section.ingredients.map((ing) => ({
                        name: ing.name,
                        volume: ing.volume || '',
                        quantity: ing.quantity?.toString() || '',
                        recipeId: ing.recipeId?.toString() || '',
                    })),
                }))
            )
            setSteps(recipe.steps)
        }
    }, [recipe])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const recipeInput = {
            name,
            description: description || null,
            servings: servings ? parseInt(servings) : null,
            numberOfUnits: numberOfUnits ? parseInt(numberOfUnits) : null,
            // Use imageUrl state (updated after upload), stripping any cache-busting query params
            imageUrl: imageUrl ? imageUrl.split('?')[0] : null,
            ingredientSections: ingredientSections.map((section) => ({
                name: section.name || null,
                ingredients: section.ingredients
                    .filter((ing) => ing.name.trim())
                    .map((ing) => ({
                        name: ing.name,
                        volume: ing.volume || null,
                        quantity: ing.quantity ? parseFloat(ing.quantity) : null,
                        recipeId: ing.recipeId ? parseInt(ing.recipeId) : null,
                    })),
            })),
            steps: steps.filter((step) => step.trim()),
        }

        onSubmit(recipeInput)
    }

    const addIngredientSection = () => {
        setIngredientSections([
            ...ingredientSections,
            { name: '', ingredients: [{ name: '', volume: '', quantity: '', recipeId: '' }] },
        ])
    }

    const removeIngredientSection = (sectionIndex: number) => {
        setIngredientSections(ingredientSections.filter((_, i) => i !== sectionIndex))
    }

    const addIngredient = (sectionIndex: number) => {
        const newSections = [...ingredientSections]
        newSections[sectionIndex].ingredients.push({ name: '', volume: '', quantity: '', recipeId: '' })
        setIngredientSections(newSections)
    }

    const removeIngredient = (sectionIndex: number, ingredientIndex: number) => {
        const newSections = [...ingredientSections]
        newSections[sectionIndex].ingredients = newSections[sectionIndex].ingredients.filter((_, i) => i !== ingredientIndex)
        setIngredientSections(newSections)
    }

    const updateIngredientSection = (sectionIndex: number, field: string, value: string) => {
        const newSections = [...ingredientSections]
        newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value }
        setIngredientSections(newSections)
    }

    const updateIngredient = (sectionIndex: number, ingredientIndex: number, field: string, value: string) => {
        const newSections = [...ingredientSections]
        newSections[sectionIndex].ingredients[ingredientIndex] = {
            ...newSections[sectionIndex].ingredients[ingredientIndex],
            [field]: value,
        }
        setIngredientSections(newSections)
    }

    const addStep = () => {
        setSteps([...steps, ''])
    }

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index))
    }

    const updateStep = (index: number, value: string) => {
        const newSteps = [...steps]
        newSteps[index] = value
        setSteps(newSteps)
    }

    const handleUploadSuccess = (newImageUrl: string) => {
        // Add timestamp to force browser to reload the image (cache busting)
        const urlWithCacheBust = `${newImageUrl}?t=${Date.now()}`
        setImageUrl(urlWithCacheBust)
        setUploadError(null)
    }

    const handleUploadError = (error: string) => {
        setUploadError(error)
    }

    return (
        <form onSubmit={handleSubmit} className={styles.recipeForm}>
            <h2>{recipe ? 'Editera recept' : 'Nytt recept'}</h2>

            <div className={styles.formGroup}>
                <label>Namn *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
                <label>Beskrivning</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Portitioner</label>
                    <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
                </div>

                <div className={styles.formGroup}>
                    <label>Antal</label>
                    <input type="number" value={numberOfUnits} onChange={(e) => setNumberOfUnits(e.target.value)} />
                </div>
            </div>

            {recipe ? (
                <>
                    <ImageUpload
                        recipeId={recipe.recipeId}
                        currentImageUrl={imageUrl}
                        onUploadSuccess={handleUploadSuccess}
                        onUploadError={handleUploadError}
                    />
                    {uploadError && <div className={styles.error}>{uploadError}</div>}
                </>
            ) : (
                <div className={styles.imageUploadPlaceholder}>
                    <p>💡 Spara receptet först för att ladda upp en bild</p>
                </div>
            )}

            <div className={styles.formSection}>
                <h3>Ingredienssektioner</h3>
                {ingredientSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={styles.ingredientSection}>
                        <div className={styles.sectionHeader}>
                            <input
                                type="text"
                                placeholder="Sektionsnamn (frivilligt)"
                                value={section.name}
                                onChange={(e) => updateIngredientSection(sectionIndex, 'name', e.target.value)}
                            />
                            {ingredientSections.length > 1 && (
                                <button type="button" onClick={() => removeIngredientSection(sectionIndex)}>
                                    Ta bort sektion
                                </button>
                            )}
                        </div>

                        {section.ingredients.map((ingredient, ingredientIndex) => (
                            <div key={ingredientIndex} className={styles.ingredient}>
                                <input
                                    type="text"
                                    placeholder="Ingrediensnamn *"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(sectionIndex, ingredientIndex, 'name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Kvantitet"
                                    value={ingredient.quantity}
                                    onChange={(e) => updateIngredient(sectionIndex, ingredientIndex, 'quantity', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Volym"
                                    value={ingredient.volume}
                                    onChange={(e) => updateIngredient(sectionIndex, ingredientIndex, 'volume', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Recept ID (om ett recept)"
                                    value={ingredient.recipeId}
                                    onChange={(e) => updateIngredient(sectionIndex, ingredientIndex, 'recipeId', e.target.value)}
                                />
                                {section.ingredients.length > 1 && (
                                    <button type="button" onClick={() => removeIngredient(sectionIndex, ingredientIndex)}>
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" onClick={() => addIngredient(sectionIndex)} className={styles.addButton}>
                            Lägg till ingrediens
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addIngredientSection} className={styles.addButton}>
                    Lägg till ingredienssektion
                </button>
            </div>

            <div className={styles.formSection}>
                <h3>Steg</h3>
                {steps.map((step, index) => (
                    <div key={index} className={styles.step}>
                        <span>{index + 1}.</span>
                        <textarea
                            value={step}
                            onChange={(e) => updateStep(index, e.target.value)}
                            rows={2}
                            placeholder="Beskrivning"
                        />
                        {steps.length > 1 && (
                            <button type="button" onClick={() => removeStep(index)}>
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={addStep} className={styles.addButton}>
                    Lägg till steg
                </button>
            </div>

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {recipe ? 'Uppdatera recept' : 'Skapa recept'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Avbryt
                </button>
            </div>
        </form>
    )
}

export default RecipeForm
