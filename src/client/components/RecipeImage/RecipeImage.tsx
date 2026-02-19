import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './RecipeImage.module.css'

interface RecipeImageProps {
    imageUrl: string | null | undefined
    imageAltText: string
    priority?: boolean // Set to true for above-the-fold images (hero)
}

// Transparent 1x1 placeholder
const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

const RecipeImage: React.FC<RecipeImageProps> = ({
    imageUrl,
    imageAltText,
    priority = false
}) => {
    const [inView, setInView] = useState(priority) // If priority, load immediately
    const placeholderRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (priority) return // Skip observer if priority

        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setInView(true)
                        obs.disconnect()
                    }
                }
            },
            {}
        )

        if (placeholderRef.current) {
            observer.observe(placeholderRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [priority])

    // For priority images (above-the-fold), always render immediately to avoid layout shift
    if (priority) {
        return (
            <div className={styles.imageWrapper}>
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={imageAltText}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.recipeImage}
                        priority={true}
                    />
                ) : (
                    <div className={styles.noImage}>
                        <span className={styles.noImageEmoji}>🍽️</span>
                    </div>
                )}
            </div>
        )
    }

    // For non-priority images, use lazy loading with IntersectionObserver
    return (
        <div ref={placeholderRef} className={styles.imageWrapper}>
            {imageUrl && inView ? (
                <Image
                    src={imageUrl}
                    alt={imageAltText}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.recipeImage}
                />
            ) : imageUrl ? (
                <Image
                    src={placeholder}
                    alt={imageAltText}
                    fill
                    className={styles.placeholderImage}
                />
            ) : (
                <div className={styles.noImage}>
                    <span className={styles.noImageEmoji}>🍽️</span>
                </div>
            )}
        </div>
    )
}

export default RecipeImage
