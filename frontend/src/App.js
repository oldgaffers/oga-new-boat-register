// App.js
import "semantic-ui-css/semantic.min.css";
import './App.css';
import React from 'react';
import Main from "./components/Main";
import AddBoat from "./components/AddBoat";
import BrowseBoats from "./components/BrowseBoats";
import Boat from "./components/Boat";
import {useRoutes} from 'hookrouter';
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloProvider } from '@apollo/react-hooks';

const client = new ApolloClient({
  link: createHttpLink({
    // read-only endpoint
    uri: process.env.BACKEND?process.env.BACKEND:"http://localhost:4000/graphql"
  }),
  cache: new InMemoryCache()
}); 

const routes = {
  "/": () => <Main />,
  "/browse": () => <ApolloProvider client={client}><BrowseBoats /></ApolloProvider>,
  "/add": () => <ApolloProvider client={client}><AddBoat /></ApolloProvider>,
  "/boats/:id": ({id}) => <ApolloProvider client={client}><Boat id={id}/></ApolloProvider>
};

const App = () => {
  const routeResult = useRoutes(routes)
  return routeResult
};

export default App;