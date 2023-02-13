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
import { PropertyService } from './api/property/property.service';
import { MediaController } from './api/media/media.controller';
import { ObjectController } from './api/object/object.controller';
import { ObjectService } from './api/object/object.service';
import { MediaService } from './api/media/media.service';
import { AuthModule } from './api/auth/auth.module';
import { MediaResolver } from './graphql/media/media.resolver';
import { PropertyResolver } from './graphql/property/property.resolver';
import {
  CommandResolver,
  ObjectResolver,
} from './graphql/object/object.resolver';
import { AuthResolver } from './graphql/user/auth.resolver';

import {
  ObjectBase,
  PropertyBase,
  ValueObject,
  ValueMedia,
  BaseMedia,
  User,
  PropertySubscriber,
} from 'core/database';
import { PubSub } from 'graphql-subscriptions';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfig.HOST,
      port: DatabaseConfig.PORT,
      username: DatabaseConfig.USERNAME,
      password: DatabaseConfig.PASSWORD,
      database: DatabaseConfig.DATABASENAME,
      entities: [
        ObjectBase,
        PropertyBase,
        ValueObject,
        ValueMedia,
        BaseMedia,
        User,
      ],
      synchronize: true,
      subscribers: [PropertySubscriber],
    }),
    TypeOrmModule.forFeature([
      ObjectBase,
      PropertyBase,
      ValueObject,
      ValueMedia,
      BaseMedia,
      User,
    ]),
    AuthModule,
  ],
  controllers: [
    AppController,
    PropertyController,
    MediaController,
    ObjectController,
  ],
  providers: [
    AppService,
    PropertyService,
    ObjectService,
    MediaService,
    MediaResolver,
    PropertyResolver,
    ObjectResolver,
    CommandResolver,
    AuthResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [AppService],
})
export class AppModule {}
