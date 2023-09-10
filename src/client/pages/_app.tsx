import "../styles/globals.css"

import { AppProps } from 'next/app'

function MumsMums({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MumsMums
