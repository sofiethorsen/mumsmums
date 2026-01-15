import React from 'react'
import { LineIcon, LineIconProps } from './LineIcon'

/**
 * Search icon - magnifying glass
 */
export const SearchIcon: React.FC<LineIconProps> = (props) => (
    <LineIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </LineIcon>
)

/**
 * Home icon - house with door
 */
export const HomeIcon: React.FC<LineIconProps> = (props) => (
    <LineIcon {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </LineIcon>
)

/**
 * Clock icon - clock face with hands
 */
export const ClockIcon: React.FC<LineIconProps> = (props) => (
    <LineIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </LineIcon>
)

/**
 * Users icon - multiple people
 */
export const UsersIcon: React.FC<LineIconProps> = (props) => (
    <LineIcon {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </LineIcon>
)
