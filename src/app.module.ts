import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Config, DatabaseConfig, MediaConfig } from './constants';
import { PropertyController } from './api/property/property.controller';
import { MediaController } from './api/media/media.controller';
import { ObjectController } from './api/object/object.controller';
import { AuthModule } from './api/auth/auth.module';
import { MediaResolver } from './graphql/media';
import { PropertyResolver } from './graphql/property';
import { CommandResolver, ObjectResolver } from './graphql/object';
import { AuthResolver } from './graphql/user';
import { PubSub } from 'graphql-subscriptions';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { DocumentController } from './api/document/document.controller';
import { DocumentService } from './api/document/document.service';
import { DocumentResolver } from './graphql/document';
@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: false,
			path: Config.GRAPHQL_LINK,
			plugins: [
				ApolloServerPluginLandingPageLocalDefault({
					embed: !Config.PRODUCTION,
				}),
			],
			autoSchemaFile: Config.GRAPHQL_FILE,
			installSubscriptionHandlers: true,
			subscriptions: {
				'subscriptions-transport-ws': {
					onConnect: (connectionParams: any) => {
						return {
							req: {
								headers: { authorization: connectionParams.Authorization },
							},
						};
					},
				},
			},
			context: ({ req }) => req,
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', MediaConfig.FORDER_FILE_PUBLIC_ROOT),
			serveRoot: MediaConfig.FORDER_FILE_PUBLIC,
			serveStaticOptions: {
				maxAge: Config.CACHE_MAXAGE * 1000,
			},
		}),
		// TypeOrmModule.forRoot({
		//   type: 'mysql',
		//   host: DatabaseConfig.HOST,
		//   port: DatabaseConfig.PORT,
		//   username: DatabaseConfig.USERNAME,
		//   password: DatabaseConfig.PASSWORD,
		//   database: DatabaseConfig.DATABASENAME,
		//   entities: Models,
		//   synchronize: true,
		//   subscribers: [PropertySubscriber],
		// }),
		// TypeOrmModule.forFeature(Models),
		AuthModule,
	],
	controllers: [
		AppController,
		PropertyController,
		MediaController,
		ObjectController,
		DocumentController,
	],
	providers: [
		AppService,
		// MediaService,
		DocumentService,
		MediaResolver,
		PropertyResolver,
		ObjectResolver,
		// CommandResolver,
		AuthResolver,
		DocumentResolver,
		{
			provide: 'PUB_SUB',
			useValue: new PubSub(),
		},
		
	],
	exports: [AppService],
})
export class AppModule { }
