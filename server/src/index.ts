import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { CMS } from 'cms';
import { Config } from "./constants"
import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import schema from "./graphql";
import { LoggerHelper } from './common/loggerhelper';
const app = express()

//static file
app.use('/static', express.static('media', {
	maxAge: Config.CACHE_MAXAGE
}))

app.use(bodyParser.json())
app.get('/', function (req, res) {
	res.send('Hello World data');
})

const server = new ApolloServer({
	schema: schema,
	plugins: [
		ApolloServerPluginLandingPageLocalDefault({
			embed: true,
		}),
	],
	context: async ({ req }) => {
    return req
  },
});
async function apolloServer() {
	await server.start()
	server.applyMiddleware({ app });

	let cms = new CMS('./config/config.json');
	await cms.init()
	app.listen(Config.PORT)
	var logger = new LoggerHelper('Main')
	logger.info(`Server http://localhost:${Config.PORT}`)
}
apolloServer()

// app.use('/graphql', expressMiddleware(server));


// logger.info(`graphql http://localhost:${Config.PORT}${server.graphqlPath}`)