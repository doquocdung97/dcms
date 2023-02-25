import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  InputType,
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import {
  JwtAuthGuardGraphql,
  //LogInWithCredentialsGuard,
} from 'src/api/auth/jwt-auth.guard';
import { CurrentUserGraphql } from 'src/api/auth/currentuser';
import { User } from 'core/database';
import {
  UserResult,
  InputUpdateUser,
  InputCreateUser,
  InputUser,
} from 'src/graphql/user/schema';
import { AuthService, UserService } from 'src/api/auth/auth.service';

@Resolver((of) => User)
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @UseGuards(JwtAuthGuardGraphql)
  @Query((returns) => User)
  async user(@CurrentUserGraphql() user: User) {
    return user;
  }
  @UseGuards(JwtAuthGuardGraphql)
  @Mutation(() => UserResult)
  async updateUser(@Args('input') input: InputUpdateUser) {
    /** now you have the file as a stream **/
    let val = Object.assign(new User(), input);
    let result = await this.userService.update(val);
    return result;
  }
  @Mutation(() => UserResult)
  async createUser(@Args('input') input: InputCreateUser) {
    /** now you have the file as a stream **/
    let val = Object.assign(new User(), input);
    let result = await this.userService.create(val);
    return result;
  }
  //@UseGuards(LogInWithCredentialsGuard)
  @Mutation(() => UserResult)
  async loginUser(@Args('input') input: InputUser) {
    /** now you have the file as a stream **/
    //let val = Object.assign(new User(), input);
    //let result = await this.userService.login(input.email, input.password);
    return await this.userService.login();
  }
}
