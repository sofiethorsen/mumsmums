import React, { useEffect } from 'react'

const ThemeManager = () => {
    useEffect(() => {
        const setTheme = () => {
            const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            const themeOverride = document.documentElement.getAttribute('data-theme-override')
            document.documentElement.setAttribute('data-theme', themeOverride || preferredTheme)
        }

        setTheme()

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme)

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setTheme)
        }
    }, [])

    return null
}

export default ThemeManager
