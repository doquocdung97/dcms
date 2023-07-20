import {
  Args,
  Resolver,
  Query,
  Mutation,
  Int,
} from '@nestjs/graphql';

import { Inject, UseGuards } from '@nestjs/common';

import { BaseResult, CustomUUID } from 'src/graphql';
import {
  InputUpdateProperty,
  InputCreateProperty,
  PropertiesResult,
  PropertyResult,
  PropertyBase,
} from './schema';
import { BaseResultCode, User } from 'cms'
import { CurrentUserGraphql, JwtAuthGuardGraphql } from '../user/guard';
import { plainToClass } from 'class-transformer';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => PropertyBase)
export class PropertyResolver {

  @Query(() => PropertyBase, { nullable: true, })
  async property(@CurrentUserGraphql() user: User.User,@Args('id', { type: () => Int }) id) {
    let doc = user.activeDocument();
    let obj = await doc.object(null, false);
    let pros = await obj?.property(id);
    if(pros){
      return PropertyBase.create(pros);
    }
    return null;
    
  }

  @Query(() => [PropertyBase], { nullable: true })
  async properties(@CurrentUserGraphql() user: User.User, @Args('objectId', { type: () => CustomUUID }) id: string) {
    let doc = user.activeDocument();
    let obj = await doc.object(id, false);
    let pros = await obj.properties();
    // var result = await this._repository.get();
    return PropertyBase.create(pros);
  }

  @Mutation(() => PropertyResult)
  async updateProperty(
    @CurrentUserGraphql() user: User.User,
    @Args('input') input: InputUpdateProperty) {
    let result = new PropertyResult();
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(null, false);
      input = plainToClass(InputUpdateProperty, input);
      let val = input.createModel()
      let pro = await obj.property(input.id, false);
      let status = await pro.update(val)
      if (status) {
        result.data = PropertyBase.create(pro)
      } else {
        result.success = false;
        result.code = BaseResultCode.B002
      }

    } catch (error) {
      result.success = false;
      result.code = BaseResultCode.B001
    }
    return result;

  }

  @Mutation(() => PropertyResult)
  async createProperty(
    @CurrentUserGraphql() user: User.User,
    @Args('objectId') id: string,
    @Args('input') input: InputCreateProperty,
  ) {
    let result = new PropertyResult();
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(id, false);
      input = plainToClass(InputCreateProperty, input);
      let val = input.createModel()
      let pros = await obj.createProperty(val);
      result.data = PropertyBase.create(pros)
    } catch (error) {
      result.success = false;
      result.code = BaseResultCode.B001
    }

    return result;
  }

  @Mutation((returns) => PropertiesResult)
  async createPropertys(
    @Args('id') id: string,
    @Args('inputs', { type: () => [InputCreateProperty] })
    inputs: [InputCreateProperty],
  ) {
    let vals = [];
    inputs.map((input) => {
      let p = new PropertyBase();
      let val = Object.assign(p, input);
      vals.push(val);
    });
    // let propertys = await this._repository.creates(id, vals);
    // return propertys;
  }

  @Mutation(() => BaseResult)
  async deleteProperty(
    @CurrentUserGraphql() user: User.User,
    @Args('id') id: number,
    @Args('soft', { defaultValue: true, nullable: true }) soft: boolean,
  ) {

    let result = new BaseResult()
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(null, false);
      let pro = await obj.property(id, false);
      let status = await pro.delete(soft);
      if (!status) {
        result.success = false;
        result.code = BaseResultCode.B002;
      }
    } catch (error) {
      console.log(error)
      result.success = false;
      result.code = BaseResultCode.B001;
    }
    return result
  }

  @Mutation(() => BaseResult)
  async restoreProperty(
    @CurrentUserGraphql() user: User.User,
    @Args('id') id: number) {
    let result = new BaseResult()
    try {
      let doc = user.activeDocument();
      let obj = await doc.object(null, false)
      let pro = await obj.property(id, false);
      let status = await pro.restore();
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
