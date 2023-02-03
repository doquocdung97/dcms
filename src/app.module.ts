import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config, DatabaseConfig, MediaConfig } from './Constants';
import { PropertyController } from './property/property.controller';
import {
  PropertyService,
  ValueObjectService,
} from './property/property.service';
import { MediaController } from './media/media.controller';
import { ObjectController } from './object/object.controller';
import { ObjectService } from './object/object.service';
import { MediaService, ValueMediaService } from './media/media.service';
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
import { ObjectResolver } from './object/object.resolver';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
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
    ValueObjectService,
    ValueMediaService,
    ObjectService,
    MediaService,
    MediaResolver,
    PropertyResolver,
    ObjectResolver,
  ],
  exports: [AppService],
})
export class AppModule {}
