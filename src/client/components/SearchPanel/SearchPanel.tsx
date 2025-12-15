import React, { useRef, useEffect } from 'react'
import style from './SearchPanel.module.css'

interface SearchPanelProps {
    isOpen: boolean
    onClose: () => void
    triggerRef: React.RefObject<HTMLElement>
}

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, triggerRef }) => {
    const panelRef = useRef<HTMLDivElement>(null)

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
                        autoFocus
                    />
                </div>
            </div>
        </>
    )
}

export default SearchPanel
