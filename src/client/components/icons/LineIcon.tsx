import React from 'react'

export interface LineIconProps {
    size?: number
    className?: string
}

interface BaseLineIconProps extends LineIconProps {
    children: React.ReactNode
}

/**
 * Base component for line-style SVG icons
 * All icons use the same SVG attributes (24x24 viewBox, stroke-based, rounded)
 */
export const LineIcon: React.FC<BaseLineIconProps> = ({ size = 20, className = '', children }) => {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    )
}
