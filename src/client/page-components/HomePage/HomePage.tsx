import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'

export default function Home() {
    return (
        <>
            <PageHead
                title={`mumsmums`}
                siteType={'website'}
                url={`https://mumsmums.app`}
            />
            <PageFrame>
                <RecipeGrid />
            </PageFrame>
        </>
    )
}
