import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config, PasswordConfig } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { CMS } from 'cms';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { LoggerHelper } from './common/loggerhelper';
// import { DataBase } from './core/database';


async function bootstrap() {
	let logger = new LoggerHelper('Main');
	logger.info(`Start App`);
	// let database = new DataBase()
	// await database.createDataSource(DatabaseConfig.MAIN)
	let cms = new CMS('./config/config.json');

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
bootstrap(); 