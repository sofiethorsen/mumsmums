import fetch from 'cross-fetch'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { BACKEND_BASE_URI } from '../../constants/environment'

const client = new ApolloClient({
    link: new HttpLink({ uri: `${BACKEND_BASE_URI}/graphql`, fetch }),
    cache: new InMemoryCache(),
});

export default client;
