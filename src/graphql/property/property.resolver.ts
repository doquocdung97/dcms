import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  InputType,
  registerEnumType,
  Directive,
  Int,
} from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import {
  BaseMedia,
  ObjectBase,
  PropertyBase,
  TypeProperty,
} from 'core/database';
import { PropertyService } from 'src/api/property/property.service';
import { BaseResult, BaseResultCode } from 'src/graphql';
import { InputUpdateProperty, InputCreateProperty } from 'src/graphql/property';
import { PropertiesResult, PropertyResult } from 'src/graphql/property';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => PropertyBase)
export class PropertyResolver {
  constructor(
    private propertyService: PropertyService, //private objectService: ObjectService,
  ) {}

  @Query((returns) => PropertyBase, { nullable: true, name: 'property' })
  async getProperty(@Args('id', { type: () => Int }) id) {
    var result = await this.propertyService.get({ id });

    return result;
  }
  @Query((returns) => [PropertyBase], { nullable: true, name: 'properties' })
  async getProperties() {
    var result = await this.propertyService.get();
    return result;
  }
  @Mutation((returns) => PropertyResult)
  async updateProperty(@Args('input') input: InputUpdateProperty) {
    let p = new PropertyBase();
    let input_new = Object.assign(p, input);
    var result = await this.propertyService.update(input_new);

    return result;
  }
  @Mutation((returns) => BaseResult)
  async deleteProperty(
    @Args('id') id: number,
    @Args('soft', { defaultValue: true, nullable: true }) soft: boolean,
  ) {
    return await this.propertyService.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreProperty(@Args('id') id: number) {
    return await this.propertyService.restore(id);
  }

  @Mutation((returns) => PropertyResult)
  async addProperty(
    @Args('id') id: string,
    @Args('input') input: InputCreateProperty,
  ) {
    let p = new PropertyBase();
    let val = Object.assign(p, input);
    let property = await this.propertyService.create(id, val);
    return property;
  }

  @Mutation((returns) => PropertiesResult)
  async addPropertys(
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
    let propertys = await this.propertyService.creates(id, vals);
    return propertys;
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
