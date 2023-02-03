import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  InputType,
  Field,
  InterfaceType,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/auth/jwt-auth.guard';
import { CurrentUserGraphql } from 'src/auth/currentuser';
import { BaseMedia, ObjectBase, PropertyBase } from 'core/database';
import { ObjectService } from './object.service';
import { CustomObject, CustomUUID } from 'core/common';
import { TypeProperty } from 'core/database/common';
import { PropertyService } from 'src/property/property.service';

@InterfaceType()
export abstract class Character {
  @Field((type) => CustomUUID)
  id: string;

  @Field()
  name: string;
}

@InputType()
export class InputAddProperty {
  @Field()
  name: string;

  @Field((type) => TypeProperty)
  type: TypeProperty;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: number;

  @Field((type) => CustomObject)
  value: any;
}

@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => ObjectBase)
export class ObjectResolver {
  constructor(
    private objectService: ObjectService,
    private propertyService: PropertyService,
  ) {}

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
  @Mutation((returns) => PropertyBase)
  async addProperty(
    @Args('id') id: string,
    @Args('input') input: InputAddProperty,
  ) {
    let obj = await this.objectService.get(id);

    if (obj instanceof ObjectBase) {
      let p = new PropertyBase();
      p.name = input.name;
      p.status = input.status;
      p.description = input.description;
      p.type = input.type;
      p.value = input.value;
      p.parent = obj as ObjectBase;
      let property = await this.propertyService.create(p);
      return property;
    }
    return null;
  }

  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
