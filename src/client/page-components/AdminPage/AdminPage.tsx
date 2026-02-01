import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import client from '../../graphql/client'
import RecipeForm, { RecipeInput } from './RecipeForm'
import styles from './AdminPage.module.css'
import { Recipe } from '../../graphql/types'
import PageFrame from '../../components/PageFrame/PageFrame'
import { BACKEND_BASE_URI } from '../../constants/environment'
import { CREATE_RECIPE, DELETE_RECIPE, GET_FULL_RECIPE, GET_RECIPES, UPDATE_RECIPE } from '../../graphql/queries'

const AdminPage: React.FC = () => {
    const router = useRouter()
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadRecipes()
    }, [])

    useEffect(() => {
        if (selectedRecipeId) {
            loadRecipe(selectedRecipeId)
        }
    }, [selectedRecipeId])

    const loadRecipes = async () => {
        setLoading(true)
        try {
            const { data } = await client.query<{ recipes: Recipe[] }>({
                query: GET_RECIPES,
                fetchPolicy: 'network-only',
            })
            setRecipes(data.recipes)
        } catch (error) {
            console.error('Error loading recipes:', error)
            alert('Failed to load recipes')
        } finally {
            setLoading(false)
        }
    }

    const loadRecipe = async (recipeId: number) => {
        setLoading(true)
        try {
            const { data } = await client.query<{ recipe: Recipe }>({
                query: GET_FULL_RECIPE,
                variables: { recipeId },
                fetchPolicy: 'network-only',
            })
            setSelectedRecipe(data.recipe)
        } catch (error) {
            console.error('Error loading recipe:', error)
            alert('Failed to load recipe')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNew = () => {
        setSelectedRecipeId(null)
        setMode('create')
    }

    const handleEdit = (recipeId: number) => {
        setSelectedRecipeId(recipeId)
        setMode('edit')
    }

    const handleDelete = async (recipeId: number) => {
        if (confirm('Vill du verkligen radera detta recept?')) {
            setLoading(true)
            try {
                await client.mutate({
                    mutation: DELETE_RECIPE,
                    variables: { recipeId },
                })
                await loadRecipes()
                alert('Recept raderades.')
            } catch (error) {
                console.error('Error deleting recipe:', error)
                alert('Failed to delete recipe')
            } finally {
                setLoading(false)
            }
        }
    }

    const handleCancel = () => {
        setMode('list')
        setSelectedRecipeId(null)
        setSelectedRecipe(null)
    }

    const handleSubmit = async (recipeInput: RecipeInput) => {
        setLoading(true)
        try {
            if (mode === 'create') {
                const { data } = await client.mutate<{ createRecipe: { recipeId: number; name: string } }>({
                    mutation: CREATE_RECIPE,
                    variables: { input: recipeInput },
                })

                if (data?.createRecipe) {
                    alert('Recept skapat.')
                    // Switch to edit mode with the newly created recipe
                    await loadRecipes()
                    setSelectedRecipeId(data.createRecipe.recipeId)
                    setMode('edit')
                }
            } else if (mode === 'edit' && selectedRecipeId) {
                await client.mutate({
                    mutation: UPDATE_RECIPE,
                    variables: { recipeId: selectedRecipeId, input: recipeInput },
                })
                alert('Recept uppdaterades.')
                await loadRecipes()
                // Reload the recipe to get updated data
                await loadRecipe(selectedRecipeId)
            }
        } catch (error) {
            console.error('Error saving recipe:', error)
            alert('Failed to save recipe')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch(`${BACKEND_BASE_URI}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            alert('Failed to logout')
        }
    }

    return (
        <PageFrame>
            <div className={styles.adminPage}>
                <div className={styles.header}>
                    <h1>Mumsmums admin</h1>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Logga ut
                    </button>
                </div>

                {loading && <div>Laddar...</div>}

                {mode === 'list' && !loading && (
                    <div className={styles.listView}>
                        <button onClick={handleCreateNew} className={styles.createButton}>
                            Skapa nytt recept
                        </button>

                        <div className={styles.recipeList}>
                            {recipes.map((recipe: Recipe) => (
                                <div key={recipe.recipeId} className={styles.recipeItem}>
                                    <span className={styles.recipeName}>{recipe.name}</span>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleEdit(recipe.recipeId)}>Editera</button>
                                        <button onClick={() => handleDelete(recipe.recipeId)}>Radera</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(mode === 'create' || mode === 'edit') && !loading && (
                    <RecipeForm
                        recipe={mode === 'edit' ? selectedRecipe : undefined}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </PageFrame>
    )
}

export default AdminPage
