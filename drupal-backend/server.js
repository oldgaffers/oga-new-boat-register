const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs')
const mysql = require('mysql2');

const typeDefs = gql(fs.readFileSync('../schema.graphql', 'utf8'))
const resolvers = require('./resolvers')

const pool  = mysql.createPool({
  connectionLimit : 4,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PWD,
  database: process.env.MYSQL_DB,
  host: process.env.MYSQL_HOST
});

const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: () => ({db: pool.promise() })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});