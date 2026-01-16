import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './RecipeImage.module.css'

interface RecipeImageProps {
    imageUrl: string | undefined
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

    // TODO: Since this component will use a much larger image, we want bigger resolution. We do have the
    // open graph images which are larger - so we're picking these here. Once we've swapped out the square
    // images everywhere, we should actually migrate to only keep the og images
    const hasImage = imageUrl && imageUrl.startsWith('/images/')
    const ogImageUrl = hasImage ? imageUrl.replace(/\.webp$/, '-og.webp') : imageUrl

    // For priority images (above-the-fold), always render immediately to avoid layout shift
    if (priority && hasImage) {
        return (
            <div className={styles.imageWrapper}>
                <Image
                    src={ogImageUrl}
                    alt={imageAltText}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.recipeImage}
                    priority={true}
                />
            </div>
        )
    }

    // For non-priority images, use lazy loading with IntersectionObserver
    return (
        <div ref={placeholderRef} className={styles.imageWrapper}>
            {hasImage && inView ? (
                <Image
                    src={ogImageUrl}
                    alt={imageAltText}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.recipeImage}
                />
            ) : (
                <Image
                    src={placeholder}
                    alt={imageAltText}
                    fill
                    className={styles.placeholderImage}
                />
            )}
        </div>
    )
}

export default RecipeImage
