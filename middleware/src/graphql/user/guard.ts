import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
	createParamDecorator
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { CMS } from 'cms';
@Injectable()
export class JwtAuthGuardGraphql extends AuthGuard('jwt') {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    try {
      if (req.headers?.authorization) {
        let app = new CMS.App()
        let user = await app.getUserByToken(req.headers.authorization)
        if (user) {
          req.user = user;//.model()
          return true
        }
  
      }
    } catch (error) {
      
    }
    return false;
  }
  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
export const CurrentUserGraphql = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const request = gqlCtx.getContext().req;
    return request.user;
  },
);
