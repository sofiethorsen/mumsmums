import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from './HomePage'

test('renders Hello world', () => {
  const { getByText } = render(<HomePage />)
  const helloWorldElement = getByText('Hello world')
  expect(helloWorldElement).toBeInTheDocument()
})
