import fetch from 'cross-fetch';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:8080/graphql', fetch }),
    cache: new InMemoryCache(),
});

export default client;
