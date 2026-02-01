import React, { useState, useRef, useCallback } from 'react'
import styles from './ImageUpload.module.css'
import { BACKEND_BASE_URI } from '../../constants/environment'

interface ImageUploadProps {
    recipeId: number
    currentImageUrl?: string | null
    onUploadSuccess: (imageUrl: string) => void
    onUploadError?: (error: string) => void
}

interface CropArea {
    x: number
    y: number
    width: number
    height: number
}

const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 600
const ASPECT_RATIO = TARGET_WIDTH / TARGET_HEIGHT // 2:1

const ImageUpload: React.FC<ImageUploadProps> = ({
    recipeId,
    currentImageUrl,
    onUploadSuccess,
    onUploadError,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [cropArea, setCropArea] = useState<CropArea | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const imageRef = useRef<HTMLImageElement>(null)
    const dragStart = useRef<{ x: number; y: number } | null>(null)

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            onUploadError?.('Please select an image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            onUploadError?.('Image must be less than 10MB')
            return
        }

        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // Load image to calculate initial crop
        const img = new Image()
        img.onload = () => {
            const imgAspect = img.width / img.height

            let cropWidth, cropHeight, cropX, cropY

            if (imgAspect > ASPECT_RATIO) {
                // Image is wider than target aspect ratio
                cropHeight = img.height
                cropWidth = cropHeight * ASPECT_RATIO
                cropX = (img.width - cropWidth) / 2
                cropY = 0
            } else {
                // Image is taller than target aspect ratio
                cropWidth = img.width
                cropHeight = cropWidth / ASPECT_RATIO
                cropX = 0
                cropY = (img.height - cropHeight) / 2
            }

            setCropArea({ x: cropX, y: cropY, width: cropWidth, height: cropHeight })
        }
        img.src = url
    }, [onUploadError])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cropArea || !imageRef.current) return

        const rect = imageRef.current.getBoundingClientRect()
        const scaleX = imageRef.current.naturalWidth / rect.width
        const scaleY = imageRef.current.naturalHeight / rect.height

        dragStart.current = {
            x: (e.clientX - rect.left) * scaleX - cropArea.x,
            y: (e.clientY - rect.top) * scaleY - cropArea.y,
        }
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !cropArea || !imageRef.current || !dragStart.current) return

        const rect = imageRef.current.getBoundingClientRect()
        const scaleX = imageRef.current.naturalWidth / rect.width
        const scaleY = imageRef.current.naturalHeight / rect.height

        let newX = (e.clientX - rect.left) * scaleX - dragStart.current.x
        let newY = (e.clientY - rect.top) * scaleY - dragStart.current.y

        // Constrain to image bounds
        newX = Math.max(0, Math.min(newX, imageRef.current.naturalWidth - cropArea.width))
        newY = Math.max(0, Math.min(newY, imageRef.current.naturalHeight - cropArea.height))

        setCropArea({ ...cropArea, x: newX, y: newY })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        dragStart.current = null
    }

    const cropAndResizeImage = async (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!selectedFile || !cropArea || !previewUrl) {
                reject(new Error('No image selected'))
                return
            }

            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = TARGET_WIDTH
                canvas.height = TARGET_HEIGHT

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Draw cropped and resized image
                ctx.drawImage(
                    img,
                    cropArea.x,
                    cropArea.y,
                    cropArea.width,
                    cropArea.height,
                    0,
                    0,
                    TARGET_WIDTH,
                    TARGET_HEIGHT
                )

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to create blob'))
                        }
                    },
                    'image/webp',
                    0.85
                )
            }
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = previewUrl
        })
    }

    const handleUpload = async () => {
        if (!selectedFile || !cropArea) return

        setIsUploading(true)

        try {
            // Crop and resize image
            const blob = await cropAndResizeImage()

            // Upload to backend
            const formData = new FormData()
            formData.append('image', blob, `${recipeId}.webp`)

            const response = await fetch(`${BACKEND_BASE_URI}/api/images/recipe/${recipeId}`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Upload failed')
            }

            const result = await response.json()
            onUploadSuccess(result.imageUrl)

            // Reset state
            setSelectedFile(null)
            setPreviewUrl(null)
            setCropArea(null)
        } catch (error) {
            onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleCancel = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setSelectedFile(null)
        setPreviewUrl(null)
        setCropArea(null)
    }

    if (selectedFile && previewUrl && cropArea) {
        return (
            <div className={styles.cropContainer}>
                <div className={styles.imageContainer}>
                    <div
                        className={styles.cropWrapper}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            ref={imageRef}
                            src={previewUrl}
                            alt="Preview"
                            className={styles.previewImage}
                            draggable={false}
                        />
                        {imageRef.current && (
                            <div
                                className={styles.cropOverlay}
                                style={{
                                    left: `${(cropArea.x / imageRef.current.naturalWidth) * 100}%`,
                                    top: `${(cropArea.y / imageRef.current.naturalHeight) * 100}%`,
                                    width: `${(cropArea.width / imageRef.current.naturalWidth) * 100}%`,
                                    height: `${(cropArea.height / imageRef.current.naturalHeight) * 100}%`,
                                }}
                            >
                                <div className={styles.cropBox} />
                            </div>
                        )}
                    </div>
                </div>
                <p className={styles.instructions}>Dra beskärningsområdet för att justera</p>
                <div className={styles.actions}>
                    <button onClick={handleCancel} disabled={isUploading} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button onClick={handleUpload} disabled={isUploading} className={styles.uploadButton}>
                        {isUploading ? 'Laddar upp...' : 'Ladda upp bild'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.uploadContainer}>
            <label className={styles.uploadLabel}>Bild</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
                id="recipe-image-upload"
            />
            <label htmlFor="recipe-image-upload" className={styles.fileInputButton}>
                {currentImageUrl ? 'Byt bild' : 'Välj bild'}
            </label>
            {currentImageUrl && (
                <div className={styles.currentImage}>
                    <img src={currentImageUrl} alt="Current recipe" />
                </div>
            )}
        </div>
    )
}

export default ImageUpload
