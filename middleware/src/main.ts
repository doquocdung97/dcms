import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config, PasswordConfig } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { CMS, LoggerHelper } from 'cms';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
// import { DataBase } from './core/database';

let logger = new LoggerHelper('Main');
async function bootstrap() {
	// let database = new DataBase()
	// await database.createDataSource(DatabaseConfig.MAIN)
	let cms = new CMS('./config.json');

	await cms.init()
	const app = await NestFactory.create(AppModule, {
		logger: new LoggerHelper('Nest'),
	});
	let port = Config.PORT;
	app.use(Config.GRAPHQL_LINK, graphqlUploadExpress());
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(port);
	logger.info(`App listening on port: ${port}`);
}
logger.info(`Start App`);
bootstrap(); 