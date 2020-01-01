const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs')

const typeDefs = gql(fs.readFileSync('schema.graphql', 'utf8'))
const resolvers = require('./drupal-backend/resolvers')
const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
