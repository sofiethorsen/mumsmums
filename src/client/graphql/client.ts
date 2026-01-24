import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { BACKEND_BASE_URI } from '../constants/environment'

const client = new ApolloClient({
    link: new HttpLink({
        uri: `${BACKEND_BASE_URI}/graphql`,
        // Apollo Client 4.0 includes extensions by default, but our Ktor backend doesn't support it, disable
        includeExtensions: false,
        // Include cookies for authentication
        credentials: 'include',
    }),
    cache: new InMemoryCache(),
})

export default client
