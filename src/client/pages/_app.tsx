import "../styles/globals.css"

import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'

function MumsMums({ Component, pageProps }: AppProps) {
  const { locale } = useRouter()

  return (
    <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
      <Component {...pageProps} />
    </NextIntlClientProvider>
  )
}

export default MumsMums
