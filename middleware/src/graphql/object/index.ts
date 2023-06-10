import {
  Args,
  Resolver,
  Query,
  Mutation,
  Field,
  ObjectType,
  Subscription,
} from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard, JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
// import { ObjectBase, ObjectMain } from 'core/database';
import { BaseResult, CustomUUID } from 'src/graphql';
import {
  InputCreateObject,
  InputUpdateObject,
  ObjectBase,
  ObjectResult,
} from './schema';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { plainToClass } from 'class-transformer';
import { REQUEST } from '@nestjs/core';
import { JwtAuthGuardGraphql, CurrentUserGraphql } from '../user/guard';
import { BaseResultCode, LoggerHelper, User } from 'cms';
// import ObjectRepository from 'src/core/database/repository/ObjectRepository';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => ObjectBase)
export class ObjectResolver {
  private _logger = new LoggerHelper("Object Graphql")
  //constructor(
  //  @CurrentUserGraphql() user: User
  //) {
  //  // console.log(user)
  //}

  @Query(() => ObjectBase, { nullable: true })
  async object(@CurrentUserGraphql() user: User.User, @Args('id') id: string) {
    let doc = user.activeDocument();
    let obj = await doc.object(id);
    return ObjectBase.create(obj);
  }
  @Query(() => [ObjectBase])
  async objects(@CurrentUserGraphql() user: User.User) {
    let doc = user.activeDocument();
    let objs = await doc.objects();
    return ObjectBase.create(objs);
  }
  // @Query((returns) => [ObjectMain], { nullable: true })
  // async treeObjects(@Args('documentId') documentId: string) {
  //   var result = await this._repository.getTree(documentId);
  //   return result;
  // }

  @Mutation(() => ObjectResult)
  async createObject(@CurrentUserGraphql() user: User.User, @Args('parentId', { nullable: true, type: () => CustomUUID }) parentId: string, @Args('input') input: InputCreateObject) {
    let result = new ObjectResult()
    try {
      let data = plainToClass(InputCreateObject, input);
      let val = data.createModel()
      let doc = user.activeDocument();
      let obj = await doc.createObject(val)
      result.data = ObjectBase.create(obj);
    } catch (error) {
      this._logger.error(`create Object ${error}`)
    }

    return result;
  }
  @Mutation(() => ObjectResult)
  async updateObject(@CurrentUserGraphql() user: User.User, @Args('input') input: InputUpdateObject) {
    let result = new ObjectResult()
    try {
      let data = plainToClass(InputUpdateObject, input);
      let model = data.createModel();
      let doc = user.activeDocument();
      let obj = await doc.object(input.id, false)
      let status = await obj.update(model)
      if (status) {
        result.data = ObjectBase.create(obj);
      } else {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (error) {

    }
    return result;
  }
  @Mutation((returns) => BaseResult)
  async deleteObject(
    @CurrentUserGraphql() user: User.User,
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    let result = new BaseResult()
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(id, false)
      let status = await obj.delete(soft)
      if (!status) {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (error) {
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result
  }
  @Mutation((returns) => BaseResult)
  async restoreObject(@CurrentUserGraphql() user: User.User,@Args('id') id: string) {
    let result = new BaseResult()
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(id, false)
      let status = await obj.restore()
      if (!status) {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (error) {
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result
  }
}