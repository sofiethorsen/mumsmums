import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchIcon from './SearchIcon'

describe('SearchIcon', () => {
    it('renders an SVG element', () => {
        const { container } = render(<SearchIcon />)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
    })

    it('uses default size of 20 when not specified', () => {
        const { container } = render(<SearchIcon />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('width', '20')
        expect(svg).toHaveAttribute('height', '20')
    })

    it('applies custom size when specified', () => {
        const { container } = render(<SearchIcon size={32} />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('width', '32')
        expect(svg).toHaveAttribute('height', '32')
    })

    it('applies custom className when specified', () => {
        const { container } = render(<SearchIcon className="custom-class" />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('custom-class')
    })

    it('renders the magnifying glass circle', () => {
        const { container } = render(<SearchIcon />)
        const circle = container.querySelector('circle')
        expect(circle).toBeInTheDocument()
        expect(circle).toHaveAttribute('cx', '11')
        expect(circle).toHaveAttribute('cy', '11')
        expect(circle).toHaveAttribute('r', '8')
    })

    it('renders the magnifying glass handle', () => {
        const { container } = render(<SearchIcon />)
        const path = container.querySelector('path')
        expect(path).toBeInTheDocument()
        expect(path).toHaveAttribute('d', 'm21 21-4.35-4.35')
    })

    it('uses currentColor for stroke', () => {
        const { container } = render(<SearchIcon />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveAttribute('stroke', 'currentColor')
    })
})
