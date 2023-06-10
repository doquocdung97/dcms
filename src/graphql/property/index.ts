import {
  Args,
  Resolver,
  Query,
  Mutation,
  Int,
} from '@nestjs/graphql';

import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import {
  PropertyBase
} from 'core/database';
import { BaseResult } from 'src/graphql';
import {
  InputUpdateProperty,
  InputCreateProperty,
  PropertiesResult,
  PropertyResult,
} from 'src/graphql/property/schema';
import PropertyRepository from 'src/core/database/repository/PropertyRepository';
import { REQUEST } from '@nestjs/core';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => PropertyBase)
export class PropertyResolver {
  private _repository: PropertyRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    this._repository = new PropertyRepository(request)
  }

  @Query((returns) => PropertyBase, { nullable: true, name: 'property' })
  async getProperty(@Args('id', { type: () => Int }) id) {
    var result = await this._repository.get(id);

    return result;
  }
  @Query((returns) => [PropertyBase], { nullable: true })
  async properties() {
    var result = await this._repository.get();
    return result;
  }
  @Mutation((returns) => PropertyResult)
  async updateProperty(@Args('input') input: InputUpdateProperty) {
    let p = new PropertyBase();
    let input_new = Object.assign(p, input);
    var result = await this._repository.update(input_new);

    return result;
  }
  @Mutation((returns) => BaseResult)
  async deleteProperty(
    @Args('id') id: number,
    @Args('soft', { defaultValue: true, nullable: true }) soft: boolean,
  ) {
    return await this._repository.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreProperty(@Args('id') id: number) {
    return await this._repository.restore(id);
  }

  @Mutation((returns) => PropertyResult)
  async addProperty(
    @Args('id') id: string,
    @Args('input') input: InputCreateProperty,
  ) {
    let p = new PropertyBase();
    let val = Object.assign(p, input);
    let property = await this._repository.create(id, val);
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
    let propertys = await this._repository.creates(id, vals);
    return propertys;
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
