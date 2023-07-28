import React from 'react'
import { render, screen } from '@testing-library/react'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('should render', async () => {
    // Render the HomePage component
    render(<HomePage />)
  })
})
