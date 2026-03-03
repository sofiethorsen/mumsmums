import LoginPage from '../../page-components/LoginPage/LoginPage'
import { getMessages } from '../../i18n'

export default LoginPage

export async function getStaticProps() {
    return {
        props: {
            messages: await getMessages('sv'),
        },
    }
}
