import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import ErrorPage from './src/views/ErrorPage/ErrorPage.tsx'
import HomePage from './src/views/HomePage/HomePage.tsx'
import RecipePage from './src/views/RecipePage/RecipePage.tsx'
import ShoppingListPage from './src/views/ShoppingListPage/ShoppingListPage.tsx'
import './globals.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/list',
    element: <ShoppingListPage />,
  },
  {
    path: '/recipe/:recipeId',
    element: <RecipePage />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
