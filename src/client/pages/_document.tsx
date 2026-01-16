import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom Document component for Next.js
 *
 * This runs on the server during SSR/SSG and allows you to customize the HTML document structure.
 *
 * By inlining a theme detection script in <Head>, we can prevent a "flash of
 * unstyled content" (FOUC) when the page loads. Without this, you might briefly see the
 * wrong theme before React hydrates and the ThemeManager component runs.
 */
export default function Document() {
    return (
        <Html>
            <Head>
                {/*
                    Inline theme detection script - runs synchronously before page paint

                    This prevents theme flash by:
                    1. Checking localStorage for user's previously saved preference
                    2. Falling back to system preference (prefers-color-scheme media query)
                    3. Setting data-theme attribute on <html> element immediately

                    This must be inline (not an external script) to execute before any CSS loads.
                    The script is minified by Next.js in production.
                */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                function getTheme() {
                                    const stored = localStorage.getItem('theme');
                                    if (stored) return stored;
                                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                }
                                document.documentElement.setAttribute('data-theme', getTheme());
                            })();
                        `,
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
