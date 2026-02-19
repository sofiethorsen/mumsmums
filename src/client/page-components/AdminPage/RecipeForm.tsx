import React, { useEffect, useState } from 'react'
import styles from './AdminPage.module.css'
import { GetRecipeByIdQuery } from '../../graphql/generated'
import ImageUpload from '../../components/ImageUpload/ImageUpload'
import Modal from '../../components/Modal/Modal'
import RecipeSectionEditor, { RecipeSectionData } from '../../components/RecipeSectionEditor/RecipeSectionEditor'
import IngredientForm from '../../components/IngredientForm/IngredientForm'
import StepsEditor from '../../components/StepsEditor/StepsEditor'
import { useIngredients, useUnits, useCreateIngredientModal } from '../../hooks'

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
            ingredientId: number | null
            unitId: number | null
        }[]
    }[]
    steps: string[]
}

interface RecipeFormProps {
    recipe?: RecipeDetails | null
    onSubmit: (recipeInput: RecipeInput) => void
    onCancel: () => void
}

const EMPTY_SECTION: RecipeSectionData = {
    name: '',
    ingredients: [{
        name: '',
        volume: '',
        quantity: '',
        recipeId: '',
        ingredientId: '',
        unitId: '',
    }],
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onSubmit, onCancel }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [servings, setServings] = useState('')
    const [numberOfUnits, setNumberOfUnits] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [sections, setSections] = useState<RecipeSectionData[]>([EMPTY_SECTION])
    const [steps, setSteps] = useState<string[]>([''])

    // Library data
    const { ingredients: libraryIngredients, addIngredient: addLibraryIngredient } = useIngredients()
    const { units: libraryUnits } = useUnits()

    // Create ingredient modal
    const createModal = useCreateIngredientModal()

    useEffect(() => {
        if (recipe) {
            setName(recipe.name)
            setDescription(recipe.description || '')
            setServings(recipe.servings?.toString() || '')
            setNumberOfUnits(recipe.numberOfUnits?.toString() || '')
            setImageUrl(recipe.imageUrl || '')
            setSections(
                recipe.ingredientSections.map((section) => ({
                    name: section.name || '',
                    ingredients: section.ingredients.map((ing) => ({
                        name: ing.name,
                        volume: ing.volume || '',
                        quantity: ing.quantity?.toString() || '',
                        recipeId: ing.recipeId?.toString() || '',
                        ingredientId: ing.ingredientId?.toString() || '',
                        unitId: ing.unitId?.toString() || '',
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
            ingredientSections: sections.map((section) => ({
                name: section.name || null,
                ingredients: section.ingredients
                    .filter((ing) => ing.name.trim())
                    .map((ing) => ({
                        name: ing.name,
                        volume: ing.volume || null,
                        quantity: ing.quantity ? parseFloat(ing.quantity) : null,
                        recipeId: ing.recipeId ? parseInt(ing.recipeId) : null,
                        ingredientId: ing.ingredientId ? parseInt(ing.ingredientId) : null,
                        unitId: ing.unitId ? parseInt(ing.unitId) : null,
                    })),
            })),
            steps: steps.filter((step) => step.trim()),
        }

        onSubmit(recipeInput)
    }

    const addSection = () => {
        setSections([...sections, EMPTY_SECTION])
    }

    const updateSection = (index: number, section: RecipeSectionData) => {
        const newSections = [...sections]
        newSections[index] = section
        setSections(newSections)
    }

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index))
    }

    const handleCreateNewIngredient = (sectionIndex: number, ingredientIndex: number, query: string) => {
        createModal.open(query, { sectionIndex, ingredientIndex })
    }

    const handleCreateIngredientSubmit = async (values: Parameters<typeof createModal.submit>[0]) => {
        const newIngredient = await createModal.submit(values)
        if (newIngredient && createModal.target) {
            addLibraryIngredient(newIngredient)
            const { sectionIndex, ingredientIndex } = createModal.target
            const section = sections[sectionIndex]
            const updatedIngredients = [...section.ingredients]
            updatedIngredients[ingredientIndex] = {
                ...updatedIngredients[ingredientIndex],
                ingredientId: newIngredient.id.toString(),
                name: newIngredient.fullNameSv,
            }
            updateSection(sectionIndex, { ...section, ingredients: updatedIngredients })
        }
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
        <>
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
                {sections.map((section, index) => (
                    <RecipeSectionEditor
                        key={index}
                        section={section}
                        libraryIngredients={libraryIngredients}
                        libraryUnits={libraryUnits}
                        canRemove={sections.length > 1}
                        onChange={(updated) => updateSection(index, updated)}
                        onCreateNewIngredient={(ingredientIndex, query) => handleCreateNewIngredient(index, ingredientIndex, query)}
                        onRemove={() => removeSection(index)}
                    />
                ))}

                <button type="button" onClick={addSection} className={styles.addButton}>
                    Lägg till ingredienssektion
                </button>
            </div>

            <StepsEditor steps={steps} onChange={setSteps} />

            <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                    {recipe ? 'Uppdatera recept' : 'Skapa recept'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Avbryt
                </button>
            </div>
        </form>

        <Modal
            isOpen={createModal.isOpen}
            onClose={createModal.close}
            title="Skapa ny ingrediens"
        >
            <IngredientForm
                mode="create"
                initialValues={{
                    nameSv: createModal.initialName,
                    fullNameSv: createModal.initialName,
                }}
                existingIngredients={libraryIngredients}
                onSubmit={handleCreateIngredientSubmit}
                onCancel={createModal.close}
                loading={createModal.loading}
                error={createModal.error}
            />
        </Modal>
    </>
    )
}

export default RecipeForm
