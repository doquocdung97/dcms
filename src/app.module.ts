import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './Constants';
import { PropertyController } from './property/property.controller';
import {
  PropertyService,
  ValueObjectService,
} from './property/property.service';
import { MediaController } from './media/media.controller';
import { ObjectController } from './object/object.controller';
import { ObjectService } from './object/object.service';
import { MediaService, ValueMediaService } from './media/media.service';
import {
  ObjectBase,
  PropertyBase,
  ValueObject,
  ValueMedia,
  BaseMedia,
  User,
} from 'core/database';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: Config.DATABASE.HOST,
      port: Config.DATABASE.PORT,
      username: Config.DATABASE.USERNAME,
      password: Config.DATABASE.PASSWORD,
      database: Config.DATABASE.DATABASENAME,
      entities: [
        ObjectBase,
        PropertyBase,
        ValueObject,
        ValueMedia,
        BaseMedia,
        User,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      ObjectBase,
      PropertyBase,
      ValueObject,
      ValueMedia,
      BaseMedia,
      User,
    ]),
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
