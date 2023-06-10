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

import { Inject, Request, UseGuards } from '@nestjs/common';
// import { User } from 'core/database';
import { CMS, User, BaseResultCode } from 'cms';
import {
  UserResult,
  InputUpdateUser,
  InputCreateUser,
  InputUser,
  User as UserSchema,
} from './schema';
import { REQUEST } from '@nestjs/core';
import { CurrentUserGraphql, JwtAuthGuardGraphql } from './guard';
// import UserRepository from 'src/core/database/repository/UserRepository';

@Resolver((of) => UserSchema)
export class AuthResolver {
  // private _repository: UserRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    // this._repository = new UserRepository(request)
  }
  @UseGuards(JwtAuthGuardGraphql)
  @Query((returns) => UserSchema)
  async user(@CurrentUserGraphql() user: User.User) {
    return user.model();
  }
  @UseGuards(JwtAuthGuardGraphql)
  @Mutation(() => UserResult)
  async updateUser(@Args('input') input: InputUpdateUser) {
    /** now you have the file as a stream **/
    // let val = Object.assign(new Models.User(), input);
    // let result = await this._repository.update(val);
    // return result;
  }
  @Mutation(() => UserResult)
  async createUser(@Args('input') input: InputCreateUser) {
    /** now you have the file as a stream **/
    // let val = Object.assign(new Models.User(), input);
    // let result = await this._repository.create(val);
    // return result;
  }
  //@UseGuards(LogInWithCredentialsGuard)
  @Mutation(() => UserResult)
  async loginUser(@Args('input') input: InputUser) {
    let result = new UserResult()
    let app = new CMS.App()
    let user = await app.login(input.email, input.password)
    if (user) {
      result.data = Object.assign(new UserSchema(), user.model())
      result.data.token = user.token()
    } else {
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result
    /** now you have the file as a stream **/
    //let val = Object.assign(new User(), input);
    //let result = await this.userService.login(input.email, input.password);
    //return await this._repository.login();
  }
}
