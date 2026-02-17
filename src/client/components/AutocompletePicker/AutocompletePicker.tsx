import React, { useState, useRef, useEffect } from 'react'
import styles from './AutocompletePicker.module.css'

export interface AutocompletePickerOption {
    id: string
    label: string
}

interface AutocompletePickerProps {
    options: AutocompletePickerOption[]
    value: string
    onChange: (id: string) => void
    placeholder?: string
    className?: string
    onCreateNew?: (query: string) => void
    createNewLabel?: (query: string) => string
}

const AutocompletePicker: React.FC<AutocompletePickerProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Sök...',
    className,
    onCreateNew,
    createNewLabel = (q) => `Skapa "${q}"...`,
}) => {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Find the selected option's label
    const selectedOption = options.find(opt => opt.id === value)

    // Filter options based on query (only show results when there's input)
    const filteredOptions = query
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(query.toLowerCase())
        )
        : []

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(0)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        setIsOpen(true)
    }

    const handleInputFocus = () => {
        setIsOpen(true)
    }

    // Calculate total items including "create new" option
    const showCreateNew = onCreateNew && query.trim().length > 0
    const totalItems = filteredOptions.slice(0, 10).length + (showCreateNew ? 1 : 0)
    const createNewIndex = filteredOptions.slice(0, 10).length

    const handleSelect = (option: AutocompletePickerOption) => {
        onChange(option.id)
        setQuery('')
        setIsOpen(false)
    }

    const handleCreateNew = () => {
        if (onCreateNew) {
            onCreateNew(query.trim())
            setQuery('')
            setIsOpen(false)
        }
    }

    const handleClear = () => {
        onChange('')
        setQuery('')
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(i => Math.min(i + 1, totalItems - 1))
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(i => Math.max(i - 1, 0))
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex === createNewIndex && showCreateNew) {
                    handleCreateNew()
                } else if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex])
                }
                break
            case 'Escape':
                setIsOpen(false)
                setQuery('')
                break
        }
    }

    return (
        <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
            <div className={styles.inputWrapper}>
                {selectedOption && !isOpen ? (
                    <div className={styles.selectedValue} onClick={() => {
                        setIsOpen(true)
                        inputRef.current?.focus()
                    }}>
                        <span>{selectedOption.label}</span>
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleClear()
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={styles.input}
                    />
                )}
            </div>
            {isOpen && query && (
                <ul className={styles.dropdown}>
                    {filteredOptions.length === 0 && !showCreateNew && (
                        <li className={styles.noResults}>Inga resultat</li>
                    )}
                    {filteredOptions.slice(0, 10).map((option, index) => (
                        <li
                            key={option.id}
                            className={`${styles.option} ${index === highlightedIndex ? styles.highlighted : ''}`}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {option.label}
                        </li>
                    ))}
                    {showCreateNew && (
                        <li
                            className={`${styles.option} ${styles.createNew} ${highlightedIndex === createNewIndex ? styles.highlighted : ''}`}
                            onClick={handleCreateNew}
                            onMouseEnter={() => setHighlightedIndex(createNewIndex)}
                        >
                            {createNewLabel(query.trim())}
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}

export default AutocompletePicker
