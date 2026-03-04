import "../styles/globals.css"

import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { NextIntlClientProvider } from 'next-intl'

function MumsMums({ Component, pageProps }: AppProps) {
  const { locale } = useRouter()
  const timeZone = typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'Europe/Stockholm'

  return (
    <NextIntlClientProvider locale={locale} messages={pageProps.messages} timeZone={timeZone}>
      <Component {...pageProps} />
    </NextIntlClientProvider>
  )
}

export default MumsMums
