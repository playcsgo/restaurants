// 載入套件
const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { loadSchemaSync } = require('@graphql-tools/load')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const path = require('path')
const passport = require('../config/passport')



const typeDefs = loadSchemaSync(path.join(__dirname, 'schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
})
const resolvers = require('./resolvers')
const schema = makeExecutableSchema({ typeDefs, resolvers })
const server = new ApolloServer({
  schema,
  introspection: true,
  playground: true
})

const startApolloServer = async (app) => {
  
  await server.start()

  app.use('/graphql', expressMiddleware(server, {
    // v4 的 context要寫在這邊
    context: async ({ req }) => {
      const authHeader = req.headers.authorization
      if (!authHeader) return {}
      const user = await new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
          if (err || !user) {
            return reject(new GraphQLError('API Unauthorized'))
          }
          resolve(user)
        })(req)
      })
      return {reqUser: user}
    } 
  }));
}

module.exports = startApolloServer
