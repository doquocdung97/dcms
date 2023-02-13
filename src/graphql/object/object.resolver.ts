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
import { CurrentUserGraphql } from 'src/api/auth/currentuser';
import { BaseMedia, ObjectBase, PropertyBase } from 'core/database';
import { ObjectService } from 'src/api/object/object.service';
import { CustomObject, CustomUUID } from 'src/graphql';
import { TypeProperty } from 'core/database/common';
import { PropertyService } from 'src/api/property/property.service';
import { BaseResult } from 'src/graphql';
import { ObjectResult } from 'src/graphql/object';
import { InputCreateObject } from 'src/graphql/object';

@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => ObjectBase)
export class ObjectResolver {
  constructor(private objectService: ObjectService) {}

  @Query((returns) => ObjectBase, { nullable: true, name: 'object' })
  async getObject(@Args('id') id: string) {
    var result = await this.objectService.get(id);
    return result;
  }
  @Query((returns) => [ObjectBase], { nullable: true, name: 'objects' })
  async getObjects() {
    var result = await this.objectService.get();
    return result;
  }

  @Mutation((returns) => ObjectResult)
  async createObject(@Args('input') input: InputCreateObject) {
    let val = Object.assign(new ObjectBase(), input);
    let result = await this.objectService.create(val);
    return result;
  }
  @Mutation((returns) => BaseResult)
  async deleteObject(
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    return await this.objectService.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreObject(@Args('id') id: string) {
    return await this.objectService.restore(id);
  }
}
import { PubSub, PubSubEngine } from 'graphql-subscriptions';

@ObjectType()
class Command {
  @Field()
  key: string;

  @Field()
  cmd: string;
}
//const pubSub = new PubSub();
const PONG_EVENT_NAME = 'Command';
@UseGuards(JwtAuthGuard)
@Resolver((of) => Command)
export class CommandResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine) {}

  @Subscription((returns) => Command, {
    defaultValue: null,
    nullable: true,
    name: PONG_EVENT_NAME,
    filter: (payload, variables) => {
      return payload.Command.key;
    },
  })
  command() {
    // let a = pubSub.asyncIterator(PONG_EVENT_NAME);
    // console.log(a);
    return this.pubSub.asyncIterator(PONG_EVENT_NAME);
  }
  @Mutation((returns) => Command)
  async addCommand(@Args('key') key: string) {
    const date = Date();

    let cmd = new Command();
    cmd.key = key;
    cmd.cmd = date.toString();
    this.pubSub.publish(PONG_EVENT_NAME, { [PONG_EVENT_NAME]: cmd });
    return cmd;
  }
}
