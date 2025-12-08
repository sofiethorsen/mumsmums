import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './SquareRecipeImage.module.css'
import generateHexColor from './colorGenerator'

interface SquareImageProps {
    imageUrl: string | undefined
    imageAltText: string
    recipeId: number
}

// transparent 300x300 png
const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAQAAADTdEb+AAACHElEQVR42u3SMQ0AAAzDsJU/6aGo+tgQouSgIBJgLIyFscBYGAtjgbEwFsYCY2EsjAXGwlgYC4yFsTAWGAtjYSwwFsbCWGAsjIWxwFgYC2OBsTAWxgJjYSyMBcbCWBgLjIWxMBYYC2NhLDAWxsJYYCyMhbHAWBgLY4GxMBbGAmNhLIwFxsJYGAuMhbEwFhgLY2EsMBbGwlhgLIyFscBYGAtjgbEwFsYCY2EsjAXGwlgYC2OBsTAWxgJjYSyMBcbCWBgLjIWxMBYYC2NhLDAWxsJYYCyMhbHAWBgLY4GxMBbGAmNhLIwFxsJYGAuMhbEwFhgLY2EsMBbGwlhgLIyFscBYGAtjgbEwFsYCY2EsjAXGwlgYC4yFsTAWGAtjYSwwFsbCWGAsjIWxwFgYC2OBsTAWxgJjYSyMBcbCWBgLjIWxMBbGAmNhLIwFxsJYGAuMhbEwFhgLY2EsMBbGwlhgLIyFscBYGAtjgbEwFsYCY2EsjAXGwlgYC4yFsTAWGAtjYSwwFsbCWGAsjIWxwFgYC2OBsTAWxgJjYSyMBcbCWBgLjIWxMBYYC2NhLDAWxsJYYCyMhbHAWBgLY4GxMBbGAmNhLIwFxsJYGAuMhbEwFhgLY2EsjCUBxsJYGAuMhbEwFhgLY2EsMBbGwlhgLIyFscBYGAtjgbEwFsYCY2EsjAXGwlgYC4yFsTAWGAtjYSwwFsbCWGAsjIWxwFjsPeVaAS0/Qs6MAAAAAElFTkSuQmCC"

const renderImage = (imageUrl: string, imageAltText: string) => {
    return <Image
        src={imageUrl}
        alt={imageAltText}
        className={styles.squareImage}
        width={300}
        height={300}
    />
}

const renderPlaceHolder = (recipeId: number) => {
    return <div
        className={styles.placeHolder}
        style={{ backgroundColor: generateHexColor(recipeId) }}
    />
}

const SquareRecipeImage: React.FC<SquareImageProps> = ({ imageUrl, imageAltText, recipeId }) => {
    const [inView, setInView] = useState(false)
    const placeholderRef = useRef<HTMLImageElement | null>(null)

    useEffect(() => {
        const observer = new IntersectionObserver((entries: IntersectionObserverEntry[], obs: IntersectionObserver) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setInView(true)
                    obs.disconnect()
                }
            }
        }, {})
        if (placeholderRef.current) {
            observer.observe(placeholderRef.current)
        }
        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <div className={styles.imageContainer}>
            {imageUrl && imageUrl.length > 0 && inView ? renderImage(imageUrl, imageAltText) : <Image ref={placeholderRef} src={placeholder} alt={imageAltText} className={styles.squareImage} width={300} height={300} />}
            {!imageUrl && renderPlaceHolder(recipeId)}
        </div>
    )
}

export default SquareRecipeImage
