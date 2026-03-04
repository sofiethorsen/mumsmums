import { useEffect, useState, type FC, type FormEvent } from 'react'
import styles from './AdminPage.module.css'
import { GetRecipeByIdQuery } from '../../graphql/generated'
import ImageUpload from '../../components/ImageUpload/ImageUpload'
import Modal from '../../components/Modal/Modal'
import RecipeSectionEditor, { RecipeSectionData } from '../../components/RecipeSectionEditor/RecipeSectionEditor'
import IngredientForm from '../../components/IngredientForm/IngredientForm'
import StepsEditor from '../../components/StepsEditor/StepsEditor'
import { useCategories, useIngredients, useUnits, useCreateIngredientModal } from '../../hooks'

// Use the query result type - we only need the fields the form actually uses
type RecipeDetails = NonNullable<GetRecipeByIdQuery['recipe']>

export interface RecipeInput {
    nameSv: string
    nameEn: string | null
    descriptionSv: string | null
    descriptionEn: string | null
    servings: number | null
    numberOfUnits: number | null
    imageUrl: string | null
    ingredientSections: {
        nameSv: string | null
        nameEn: string | null
        ingredients: {
            name: string
            volume: string | null
            quantity: number | null
            recipeId: number | null
            ingredientId: number | null
            unitId: number | null
        }[]
    }[]
    stepsSv: string[]
    stepsEn: string[]
}

interface RecipeFormProps {
    recipe?: RecipeDetails | null
    onSubmit: (recipeInput: RecipeInput, categoryIds: number[]) => void
    onCancel: () => void
}

const EMPTY_SECTION: RecipeSectionData = {
    name: '',
    nameEn: '',
    ingredients: [{
        name: '',
        volume: '',
        quantity: '',
        recipeId: '',
        ingredientId: '',
        unitId: '',
    }],
}

const RecipeForm: FC<RecipeFormProps> = ({ recipe, onSubmit, onCancel }) => {
    const [name, setName] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [description, setDescription] = useState('')
    const [descriptionEn, setDescriptionEn] = useState('')
    const [servings, setServings] = useState('')
    const [numberOfUnits, setNumberOfUnits] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [sections, setSections] = useState<RecipeSectionData[]>([EMPTY_SECTION])
    const [steps, setSteps] = useState<string[]>([''])
    const [stepsEn, setStepsEn] = useState<string[]>([''])
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])

    // Library data
    const { ingredients: libraryIngredients, addIngredient: addLibraryIngredient } = useIngredients()
    const { units: libraryUnits } = useUnits()
    const { categories } = useCategories()

    // Create ingredient modal
    const createModal = useCreateIngredientModal()

    useEffect(() => {
        if (recipe) {
            setName(recipe.nameSv)
            setNameEn(recipe.nameEn || '')
            setDescription(recipe.descriptionSv || '')
            setDescriptionEn(recipe.descriptionEn || '')
            setServings(recipe.servings?.toString() || '')
            setNumberOfUnits(recipe.numberOfUnits?.toString() || '')
            setImageUrl(recipe.imageUrl || '')
            setSections(
                recipe.ingredientSections.map((section) => ({
                    name: section.nameSv || '',
                    nameEn: section.nameEn || '',
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
            setSteps(recipe.stepsSv)
            setStepsEn(recipe.stepsEn.length > 0 ? recipe.stepsEn : [''])
            setSelectedCategoryIds(recipe.categories.map(c => c.id))
        }
    }, [recipe])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        const recipeInput = {
            nameSv: name,
            nameEn: nameEn || null,
            descriptionSv: description || null,
            descriptionEn: descriptionEn || null,
            servings: servings ? parseInt(servings) : null,
            numberOfUnits: numberOfUnits ? parseInt(numberOfUnits) : null,
            // Use imageUrl state (updated after upload), stripping any cache-busting query params
            imageUrl: imageUrl ? imageUrl.split('?')[0] : null,
            ingredientSections: sections.map((section) => ({
                nameSv: section.name || null,
                nameEn: section.nameEn || null,
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
            stepsSv: steps.filter((step) => step.trim()),
            stepsEn: stepsEn.filter((step) => step.trim()),
        }

        onSubmit(recipeInput, selectedCategoryIds)
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
                <label>Namn (svenska) *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
                <label>Namn (engelska)</label>
                <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
                <label>Beskrivning (svenska)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className={styles.formGroup}>
                <label>Beskrivning (engelska)</label>
                <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} />
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
                    <p>Spara receptet först för att ladda upp en bild</p>
                </div>
            )}

            {categories.length > 0 && (
                <div className={styles.formSection}>
                    <h3>Kategorier</h3>
                    {[...categories].sort((a, b) => a.nameSv.localeCompare(b.nameSv, 'sv')).map(category => (
                        <label key={category.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(category.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedCategoryIds(prev => [...prev, category.id])
                                    } else {
                                        setSelectedCategoryIds(prev => prev.filter(id => id !== category.id))
                                    }
                                }}
                            />
                            {category.nameSv}
                        </label>
                    ))}
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

            <StepsEditor steps={steps} onChange={setSteps} label="Steg (svenska)" />
            <StepsEditor steps={stepsEn} onChange={setStepsEn} label="Steg (engelska)" />

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
