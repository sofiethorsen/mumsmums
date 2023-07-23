import React from 'react'
import  { createRoot }  from 'react-dom/client';
import HomePage from './src/views/homepage/HomePage.tsx'

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<HomePage/>);
