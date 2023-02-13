import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordConfig } from '../../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //jwtFromRequest: ExtractJwt.fromExtractors([
      //  (request: Request) => {
      //    console.log(request?.cookies?.Authentication);
      //    return request?.cookies?.Authentication;
      //  },
      //]),
      ignoreExpiration: false,
      secretOrKey: PasswordConfig.AUTH_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    //let data = { userId: payload.sub, username: payload.username };
    let user = await this.usersService.findOne(payload.email);
    delete user['password'];
    return user;
  }
}
