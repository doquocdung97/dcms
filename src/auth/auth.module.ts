import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from '../Constants';
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
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    //UsersModule,
    PassportModule,
    JwtModule.register({
      secret: Config.AUTH_SECRET_KEY,
      //signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
