import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import svMessages from '../messages/sv.json'

interface IntlRenderOptions extends RenderOptions {
    locale?: string
    messages?: Record<string, unknown>
}

export function renderWithIntl(
    ui: ReactElement,
    { locale = 'sv', messages, ...renderOptions }: IntlRenderOptions = {}
) {
    const msgs = messages ?? (locale === 'sv' ? svMessages : undefined)

    return render(
        <NextIntlClientProvider locale={locale} messages={msgs}>
            {ui}
        </NextIntlClientProvider>,
        renderOptions
    )
}
