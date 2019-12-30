import React, { useState } from 'react';

import ApolloClient from "apollo-client";
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import Boats from './Boats.js';
import { CardGroup, Container, Divider, Header, Pagination } from 'semantic-ui-react';
import TopMenu from './TopMenu.js';

const client = new ApolloClient({
  link: createHttpLink({
    // read-only endpoint
    uri: "http://localhost:4000/graphql"
  }),
  cache: new InMemoryCache()
});

const BrowseBoats = () => {

  const [activePage, setActivePage] = useState(1);

  const onLoad = (totalCount) => {
    console.log('onLoad', totalCount)
  }

  const onChange = (_, pageInfo) => {
    setActivePage(pageInfo.activePage);
    console.log(pageInfo);
  };

  return (
  <ApolloProvider client={client}>
    <TopMenu/>
    <Header as="h1">Browse Boats</Header>
    <CardGroup>
      <Boats page={activePage} boatsPerPage={8} onLoad={onLoad} />
    </CardGroup>
    <Divider />
    <Container>
      <Pagination 
      activePage={activePage}
      onPageChange={onChange}
      totalPages={10}
       />
    </Container>
  </ApolloProvider>
  );
};

export default BrowseBoats;