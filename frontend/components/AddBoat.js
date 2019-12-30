
import React from 'react';
import ApolloClient from "apollo-client";
import { ApolloProvider } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import Boats from './Boats.js';
import { Frontier } from "frontier-forms";
import {
  Form,
  Input,
} from 'semantic-ui-react'

const mutation = gql`
  mutation(
    $name: String!
    $class: String!
  ) {
    addBoat(
      name: $name
      class: $class
      ) {
      id
    }
  }
`;

const client = new ApolloClient({
  link: createHttpLink({
    // read-only endpoint
    uri: "http://localhost:4000/graphql"
  }),
  cache: new InMemoryCache()
});

const AddBoat = () => {
  return (
  <ApolloProvider client={client}>
    <div>
      <h2>Boat Register with Apollo <span role="img" aria-label="apollo">🚀</span></h2>
      <Boats/>
      <Frontier
          mutation={mutation}
          client={client}
          initialValues={{ name: 'Paddy', class: 'Padstow Lugger' }}
          resetOnSave={false}
        >
          {({ state, modifiers, form }) => {
            return (
              <form className="ui form" onSubmit={event => {
                console.log(state);
                console.log(modifiers.name);
                console.log(modifiers.class);
                if(state.dirty) {
                  form.submit();
                  alert("!")
                }
                }}>
                <Form.Field>
                  <label htmlFor="name">Name*</label> <br />
                  <Input
                    type="text"
                    name="name"
                    value={state.values.name}
                    onChange={modifiers.name.change}
                  />
                  {state.errors.name && <p>Error: "{state.errors.name}"</p>}
                </Form.Field>
                <Form.Field>
                  <label htmlFor="name">Class*</label> <br />
                  <Input
                    type="text"
                    name="class"
                    value={state.values.class}
                    onChange={modifiers.class.change}
                  />
                  {state.errors.class && (
                    <p>Error: "{state.errors.class}"</p>
                  )}
                </Form.Field>
                <p>
                  <input type="submit" value="Save" className="ui button" />
                </p>
              </form>
            );
          }}
        </Frontier>
    </div>
  </ApolloProvider>
  );
};

export default AddBoat;