import { Module } from '@nestjs/common';
import { AuthService, UserService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config, DatabaseConfig, PasswordConfig } from '../Constants';
import { User } from 'core/database';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfig.HOST,
      port: DatabaseConfig.PORT,
      username: DatabaseConfig.USERNAME,
      password: DatabaseConfig.PASSWORD,
      database: DatabaseConfig.DATABASENAME,
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    //UsersModule,
    PassportModule,
    JwtModule.register({
      secret: PasswordConfig.AUTH_SECRET_KEY,
      //signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy],
  exports: [AuthService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
