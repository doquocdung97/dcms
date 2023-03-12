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
import { JwtAuthGuard, JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import { ObjectBase, ObjectMain } from 'core/database';
import { BaseResult, CustomUUID } from 'src/graphql';
import {
  InputCreateObject,
  InputUpdateObject,
  ObjectResult,
} from 'src/graphql/object/schema';
import { PubSub, PubSubEngine } from 'graphql-subscriptions';
import { plainToClass } from 'class-transformer';
import { REQUEST } from '@nestjs/core';
import ObjectRepository from 'src/core/database/repository/ObjectRepository';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => ObjectBase)
export class ObjectResolver {
  private _repository: ObjectRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    this._repository = new ObjectRepository(request)
  }

  @Query((returns) => ObjectBase, { nullable: true })
  async object(@Args('id') id: string) {
    var result = await this._repository.get(id);
    return result;
  }
  @Query((returns) => [ObjectBase], { nullable: true })
  async objects() {
    var result = await this._repository.get();
    return result;
  }
  @Query((returns) => [ObjectMain], { nullable: true })
  async treeObjects(@Args('documentId') documentId: string) {
    var result = await this._repository.getTree(documentId);
    return result;
  }

  @Mutation((returns) => ObjectResult)
  async createObject(@Args('parentId',{nullable:true}) parentId: string,@Args('input') input: InputCreateObject) {
    let data = plainToClass(InputCreateObject, input);
    let val = data.createModel()
    let result = await this._repository.create(parentId,val);
    return result;
  }
  @Mutation((returns) => ObjectResult)
  async updateObject(@Args('input') input: InputUpdateObject) {
    //let val = Object.assign(new ObjectBase(), input);
    let data = plainToClass(InputUpdateObject, input);
    let model = await data.createModel();

    let result = await this._repository.update(model);
    return result;
  }
  @Mutation((returns) => BaseResult)
  async deleteObject(
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    return await this._repository.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreObject(@Args('id') id: string) {
    return await this._repository.restore(id);
  }
}

@ObjectType()
class Command {
  @Field()
  key: string;

  @Field()
  cmd: string;
}
const pubSub = new PubSub();
const PONG_EVENT_NAME = 'Command';
@UseGuards(JwtAuthGuard)
// @Resolver((of) => Command)
export class CommandResolver {
  constructor() {}

  @Subscription((returns) => Command, {
    defaultValue: null,
    nullable: true,
    name: PONG_EVENT_NAME,
    filter: (payload, variables) => {
      console.log(payload, variables)
      return payload.Command.key;
    },
  })
  command(@Args('id',{type:()=>CustomUUID}) id: string) {
    // let a = pubSub.asyncIterator(PONG_EVENT_NAME);
    // console.log(a);
    return pubSub.asyncIterator(PONG_EVENT_NAME);
  }
  @Mutation((returns) => Command)
  async addCommand(@Args('key') key: string) {
    const date = Date();

    let cmd = new Command();
    cmd.key = key;
    cmd.cmd = date.toString();
    pubSub.publish(PONG_EVENT_NAME, { [PONG_EVENT_NAME]: cmd });
    return cmd;
  }
}
