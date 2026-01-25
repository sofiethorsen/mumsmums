import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './LoginPage.module.css'
import PageFrame from '../../components/PageFrame/PageFrame'
import { BACKEND_BASE_URI } from '../../constants/environment'

const LoginPage: React.FC = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${BACKEND_BASE_URI}/api/auth/status`, {
                    credentials: 'include',
                })
                const data = await response.json()
                if (data.authenticated) {
                    const redirectTo = (router.query.redirect as string) || '/'
                    router.push(redirectTo)
                }
            } catch (err) {
                // If auth check fails, stay on login page
                console.error('Auth check error:', err)
            }
        }
        checkAuth()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`${BACKEND_BASE_URI}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Redirect to home page on successful login - update this to admin page later
                const redirectTo = (router.query.redirect as string) || '/'
                router.push(redirectTo)
            } else {
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PageFrame>
            <div className={styles.loginPage}>
                <div className={styles.loginCard}>
                    <h1>Logga in</h1>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Lösenord</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Loggar in...' : 'Logga in'}
                        </button>
                    </form>
                </div>
            </div>
        </PageFrame>
    )
}

export default LoginPage
