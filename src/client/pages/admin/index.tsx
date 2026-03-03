import AdminPage from '../../page-components/AdminPage/AdminPage'
import { getMessages } from '../../i18n'

export default AdminPage

export async function getStaticProps() {
    return {
        props: {
            messages: await getMessages('sv'),
        },
    }
}
