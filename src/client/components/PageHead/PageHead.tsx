import Head from 'next/head'
import Script from 'next/script'

interface PageMeta {
    title: string
    siteType: string
    url: string
    description?: string | undefined
    imageUrl?: string | undefined
    fbPreviewImageUrl?: string | undefined
}

const renderPreviewImageTag = (meta: PageMeta) => {
    if (meta.fbPreviewImageUrl) {
        return (
            <>
                <meta property="og:image" content={meta.fbPreviewImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="600" />
            </>
        )
    } else if (meta.imageUrl) {
        return (
            <>
                <meta property="og:image" content={meta.imageUrl} />
                <meta property="og:image:width" content="300" />
                <meta property="og:image:height" content="300" />
            </>
        )
    } else {
        return null
    }
}

const PageHead: React.FC<PageMeta> = (meta: PageMeta) => {
    return (
        <>
            <Head>
                <title>{meta.title}</title>
                <meta property="og:title" content={meta.title} key="title" />
                <meta property="og:site_name" content="mumsmums" />
                <meta property="og:type" content={meta.siteType} />
                <meta property="og:url" content={meta.url} />
                <meta property="og:locale" content="sv_SE" />
                {meta.description && <meta property="og:description" content={meta.description} />}
                {renderPreviewImageTag(meta)}

            </Head>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-B8H3QFWGYX" />
            <Script id="google-analytics">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', 'G-B8H3QFWGYX');
                `}
            </Script>
        </>
    )
}

export default PageHead
