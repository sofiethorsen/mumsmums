import React, { useEffect } from 'react'
import styles from './SquareRecipeImage.module.css'
import generateHexColor from './colorGenerator'

interface SquareImageProps {
    imageUrl: string | undefined
    imageAltText: string
    recipeId: number
}

const renderImage = (imageUrl: string, imageAltText: string) => {
    return <img
        src={imageUrl}
        alt={imageAltText}
        data-src=""
        className={styles.squareImage}
        loading="lazy"
    />
}

const renderPlaceHolder = (recipeId: number) => {
    return <div
        className={styles.placeHolder}
        style={{ backgroundColor: generateHexColor(recipeId) }}
    />
}

const SquareRecipeImage: React.FC<SquareImageProps> = ({ imageUrl, imageAltText, recipeId }) => {
    useEffect(() => {
        const lazyImages = document.querySelectorAll(`.${styles.squareImage}`)

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1, // 10% of the image visible
        }

        function handleIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target
                    img.setAttribute('data-src', img.getAttribute('src') || '')
                    img.classList.add(styles.loaded)
                    observer.unobserve(img) // Stop observing once image is loaded
                }
            })
        }

        const imageObserver = new IntersectionObserver(handleIntersection, observerOptions)

        // Start observing each lazy image
        lazyImages.forEach(image => {
            console.log(image)
            imageObserver.observe(image)
        })

        return () => {
            // Clean up the observer when the component unmounts
            lazyImages.forEach(image => {
                imageObserver.unobserve(image)
            })
        }
    }, []) // Run only once on component mount

    return (
        <div className={styles.imageContainer}>
            {imageUrl && imageUrl.length > 0 && renderImage(imageUrl, imageAltText)}
            {!imageUrl && renderPlaceHolder(recipeId)}
        </div>
    )
}

export default SquareRecipeImage
