import React, { useRef, useEffect, useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'
import style from './SearchPanel.module.css'
import { RecipePreview } from '../../graphql/types'

interface SearchPanelProps {
    isOpen: boolean
    onClose: () => void
    triggerRef: React.RefObject<HTMLElement>
    recipes: RecipePreview[]
}

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, triggerRef, recipes }) => {
    const panelRef = useRef<HTMLDivElement>(null)
    const [query, setQuery] = useState('')

    const fuse = useMemo(
        () =>
            new Fuse(recipes, {
                keys: ['name'],
                threshold: 0.3, // 0 = exact match, 1 = match anything
                ignoreLocation: true,
            }),
        [recipes]
    )

    // Get search results (only when query is at least 2 characters)
    const results = useMemo(() => {
        if (!query.trim() || query.trim().length < 2) return []
        return fuse.search(query).map((result) => result.item)
    }, [query, fuse])

    // Reset state when panel closes
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
        }
    }, [isOpen])

    // Handle click outside to close search panel
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                panelRef.current &&
                triggerRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose()
            }
        }

        // Handle ESC key to close search panel
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscKey)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [isOpen, onClose, triggerRef])

    if (!isOpen) return null

    return (
        <>
            <div className={style.backdrop} onClick={onClose} />
            <div ref={panelRef} className={style.searchPanel}>
                <div className={style.searchContent}>
                    <input
                        type="text"
                        className={style.searchInput}
                        placeholder="Sök efter recept..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />

                    {results.length > 0 && (
                        <div className={style.results}>
                            {results.map((recipe) => (
                                <Link
                                    key={recipe.recipeId}
                                    href={`/recipe/${recipe.recipeId}`}
                                    className={style.resultItem}
                                    onClick={onClose}
                                >
                                    {recipe.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {query.trim() && query.trim().length >= 2 && results.length === 0 && (
                        <div className={style.noResults}>Inga recept hittades för "{query}"</div>
                    )}
                </div>
            </div>
        </>
    )
}

export default SearchPanel
