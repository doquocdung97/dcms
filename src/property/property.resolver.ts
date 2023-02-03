import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/auth/jwt-auth.guard';
import {
  BaseMedia,
  ObjectBase,
  PropertyBase,
  TypeProperty,
} from 'core/database';
import { PropertyService } from './property.service';
import { CustomObject, CustomUUID } from 'core/common';

@InputType()
export class InputUpdateProperty {
  @Field()
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field((type) => TypeProperty, { nullable: true })
  type: TypeProperty;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: number;

  @Field((type) => CustomObject, { nullable: true })
  value: any;
}

@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => PropertyBase)
export class PropertyResolver {
  constructor(private propertyService: PropertyService) {}

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
  @Mutation((returns) => PropertyBase)
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
    let data = await this.propertyService.delete(id, soft);
    let result = new BaseResult();
    if (data.affected == 0) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  @Mutation((returns) => BaseResult)
  async restoreProperty(@Args('id') id: number) {
    let data = await this.propertyService.restore(id);
    let result = new BaseResult();
    if (data.affected == 0) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
enum BaseResultCode {
  B000,
  B001,
  B002,
  B003,
}
registerEnumType(BaseResultCode, {
  name: 'BaseResultCode',
  description: 'Base Result Code',
  valuesMap: {
    B000: {
      description: 'The default color.',
      deprecationReason: 'Too blue.',
    },
  },
});

@ObjectType()
class BaseResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  //@Field({ nullable: true })
  //message: string;
}
