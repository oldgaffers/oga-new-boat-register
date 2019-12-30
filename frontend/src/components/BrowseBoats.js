import React from 'react';
import ApolloClient from "apollo-client";
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import Boats from './Boats.js';
import { CardGroup, Header } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';

const client = new ApolloClient({
  link: createHttpLink({
    // read-only endpoint
    uri: "http://localhost:4000/graphql"
  }),
  cache: new InMemoryCache()
});

const BrowseBoats = () => {
  return (
  <ApolloProvider client={client}>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <CardGroup>
      <Boats/>
    </CardGroup>
  </ApolloProvider>
  );
};

export default BrowseBoats;