import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Icon from './Icon'

describe('Icon', () => {
    describe('decorative icons (no alt text)', () => {
        it('renders an icon with the correct src', () => {
            render(<Icon name="search" />)
            // Icons with empty alt have role="presentation"
            const icon = screen.getByRole('presentation')
            expect(icon).toHaveAttribute('src', '/icons/search.svg')
        })

        it('uses default size of 24px when size is not provided', () => {
            render(<Icon name="menu-burger" />)
            const icon = screen.getByRole('presentation')
            expect(icon).toHaveStyle({ width: '24px', height: '24px' })
        })

        it('applies custom size when provided', () => {
            render(<Icon name="pan-frying" size={32} />)
            const icon = screen.getByRole('presentation')
            expect(icon).toHaveStyle({ width: '32px', height: '32px' })
        })

        it('applies additional className when provided', () => {
            render(<Icon name="circle-user" className="custom-class" />)
            const icon = screen.getByRole('presentation')
            expect(icon).toHaveClass('custom-class')
        })

        it('has empty alt text by default', () => {
            render(<Icon name="search" />)
            const icon = screen.getByRole('presentation')
            expect(icon).toHaveAttribute('alt', '')
        })
    })

    describe('accessible icons (with alt text)', () => {
        it('renders icon with alt text', () => {
            render(<Icon name="search" alt="Search recipes" />)
            const icon = screen.getByRole('img', { name: 'Search recipes' })
            expect(icon).toBeInTheDocument()
        })

        it('uses provided alt text', () => {
            render(<Icon name="menu-burger" alt="Open menu" />)
            const icon = screen.getByRole('img')
            expect(icon).toHaveAttribute('alt', 'Open menu')
        })

        it('icon with alt text is accessible', () => {
            render(<Icon name="circle-user" alt="User profile" />)
            const icon = screen.getByAltText('User profile')
            expect(icon).toBeInTheDocument()
        })
    })

    it('renders all icon types correctly', () => {
        const iconNames: Array<'menu-burger' | 'search' | 'circle-user' | 'pan-frying'> = [
            'menu-burger',
            'search',
            'circle-user',
            'pan-frying',
        ]

        iconNames.forEach(name => {
            const { container } = render(<Icon name={name} />)
            const icon = container.querySelector('img')
            expect(icon).toHaveAttribute('src', `/icons/${name}.svg`)
        })
    })
})
