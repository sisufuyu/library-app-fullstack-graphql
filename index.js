const { ApolloServer } = require('apollo-server-express')
// const { v1: uuidv1 } = require('uuid')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const express = require('express')
const http = require('http')
const User = require('./models/user')

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'SECRET'

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

require('dotenv').config()

const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => console.log('connected to MogoDB ' + MONGODB_URI))
  .catch(err => console.log('failed connect to MogoDB ' + err.message))

mongoose.set('debug', true)

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {
//     const auth = req ? req.headers.authorization : '';
//     if(auth && auth.toLocaleLowerCase().startsWith('bearer ')){
//       const token = auth.substring(7)
//       const decoded = jwt.verify(token, JWT_SECRET)
//       const currentUser = await User.findById(decoded.id)
//       return { currentUser }
//     }
//   }
// })

// server.listen().then(({ url }) => {
//   console.log(`Server ready at ${url}`)
// })

const start = async () => {
  const app = express()
  app.use(express.static('build'))

  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe }, 
    { server: httpServer, path: '' }
  )

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if(auth && auth.toLowerCase().startsWith('bearer ')){
        const decoded = jwt.verify(auth.substring(7), JWT_SECRET)
        const currentUser = await User.findById(decoded.id)
        return { currentUser }
      }
    },
    plugins: [
      // Proper shutdown for the HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            }
          }
        }
      }
    ]
  })

  await server.start()
  server.applyMiddleware({ app, path: '/' })

  const PORT = process.env.PORT || 4000
  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`)
  })
}

start()
