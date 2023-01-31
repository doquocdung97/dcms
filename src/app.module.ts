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
  History,
} from 'core/database';
import { AuthModule } from './auth/auth.module';
import { MediaSubscriber } from 'core/database/subscriber/MediaSubscriber';
@Module({
  imports: [
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
        History,
      ],
      subscribers: [MediaSubscriber],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      ObjectBase,
      PropertyBase,
      ValueObject,
      ValueMedia,
      BaseMedia,
      User,
      History,
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
  ],
  exports: [AppService],
})
export class AppModule {}
