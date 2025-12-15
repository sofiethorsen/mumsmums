import React from 'react'
import style from './Icon.module.css'

// The name should match one of the svgs under src/client/public/icons
export type IconName = 'menu-burger' | 'search' | 'circle-user' | 'pan-frying'

interface IconProps {
    name: IconName
    size?: number
    className?: string
    alt?: string
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className, alt = '' }) => {
    return (
        <img
            src={`/icons/${name}.svg`}
            alt={alt}
            className={`${style.icon} ${className || ''}`}
            style={{ width: size, height: size }}
        />
    )
}

export default Icon
