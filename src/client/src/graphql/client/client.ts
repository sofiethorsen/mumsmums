import fetch from 'cross-fetch';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// TODO: set via webpack config, i.e. something like:
//const host = process.env.NODE_ENV === "development" ? "http://localhost:8080" : ""
const isProd = true
const host = isProd ? "" : "http://localhost:8080"

const client = new ApolloClient({
    link: new HttpLink({ uri: `${host}/graphql`, fetch }),
    cache: new InMemoryCache(),
});

export default client;
