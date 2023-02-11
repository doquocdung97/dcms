import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config, DatabaseConfig, MediaConfig } from './Constants';
import { PropertyController } from './property/property.controller';
import { PropertyService } from './property/property.service';
import { MediaController } from './media/media.controller';
import { ObjectController } from './object/object.controller';
import { ObjectService } from './object/object.service';
import { MediaService } from './media/media.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import {
  ObjectBase,
  PropertyBase,
  ValueObject,
  ValueMedia,
  BaseMedia,
  User,
  PropertySubscriber,
} from 'core/database';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MediaResolver } from './media/media.resolver';
import { PropertyResolver } from './property/property.resolver';
import { CommandResolver, ObjectResolver } from './object/object.resolver';
import { AuthResolver } from './auth/auth.resolver';
import { PubSub } from 'graphql-subscriptions';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: any) => {
            console.log(context.connectionParams);
            if (!context.connectionParams) return;
            return {
              req: {
                headers: {
                  authorization: context.connectionParams.Authorization,
                },
              },
            };
          },
        },
        'subscriptions-transport-ws': {
          onConnect: (connectionParams: any) => {
            console.log('subscriptions-transport-ws', connectionParams);
            return {
              req: {
                headers: { authorization: connectionParams.Authorization },
              },
            };
          },
        },
      },
      context: ({ req }) => {
        return req;
      },
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
