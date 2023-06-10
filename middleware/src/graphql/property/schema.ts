import { CustomObject, CustomUUID } from 'src/graphql';
import {
  MinLength,
  MaxLength,
  Length,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import {
  Field,
  InputType,
  registerEnumType,
  ObjectType,
} from '@nestjs/graphql';
import { ObjectBase } from '../object/schema';
import { BaseResultCode, Property } from 'cms';
import { plainToClass } from 'class-transformer';

registerEnumType(Property.TypeProperty, {
  name: 'TypeProperty',
  description: 'The basic directions',
  valuesMap: {},
});

// @ObjectType()
// export class PropertyStandard {
//   @Field()
//   type:string
//   @Field()
//   value:Object
// }


@ObjectType()
export class PropertyBase {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => Property.TypeProperty)
  type: Property.TypeProperty;

  max: number;

  min: number;

  @Field()
  status: number;

  // @Column({ default: null })
  // attribute_str: string;

  // attribute: any;


  // parent: ObjectBase;

  @Field((type) => CustomObject, { nullable: true })
  value: any = {};

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deleteAt: Date;

  static create(model: Property.Property): PropertyBase
  static create(model: Property.Property[]): PropertyBase[]
  static create(model) {
    if (model instanceof Array) {
      let objs = []
      model.map((item: Property.Property) => {
        objs.push(plainToClass(PropertyBase, item.model()))
      })
      return objs
    }
    return plainToClass(PropertyBase, model.model())
  }
}


@InputType()
export class InputUpdateProperty {
  @Field()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  name?: string;

  @Field((type) => Property.TypeProperty, { nullable: true })
  type: Property.TypeProperty;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: number;

  @Field((type) => CustomObject, { nullable: true })
  value: any;
  createModel():Property.InputUpdateProperty{
    let model = plainToClass(Property.InputUpdateProperty,this)
    return model
  }
}

@InputType()
export class InputCreateProperty {
  @Field()
  @MinLength(5)
  @MaxLength(50)
  name: string;

  @Field((type) => Property.TypeProperty)
  type: Property.TypeProperty;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: number;

  @Field((type) => CustomObject)
  value: any;
  createModel():Property.InputCreateProperty{
    let model = plainToClass(Property.InputCreateProperty,this)
    return model
  }
}

@ObjectType()
export class PropertyResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => PropertyBase, { nullable: true })
  data: PropertyBase;
}

@ObjectType()
export class PropertiesResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => [PropertyBase], { nullable: true })
  data: PropertyBase[];
}
