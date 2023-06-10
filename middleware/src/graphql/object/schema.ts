import {
  InputType,
  registerEnumType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
// import { BaseDocument, BaseResultCode, ObjectBase, PropertyBase } from 'core/database';
import { BaseResultCode, Base, Objective } from 'cms'
// import {
//   InputUpdateProperty,
//   InputCreateProperty,
// } from 'src/graphql/property/schema';
import { CustomUUID } from '../graphqlscalartype';
import {PropertyBase} from '../property/schema'

@ObjectType()
export class PropertyObject {
  @Field((type) => CustomUUID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  type: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deleteAt: Date;
}

@ObjectType()
export class ObjectBase extends PropertyObject{
  @Field((type) => [PropertyBase], { defaultValue: [] })
  properties: PropertyBase[];

  static create(model: Base.Objective): ObjectBase
  static create(model: Base.Objective[]): ObjectBase[]
  static create(model) {
    if (model instanceof Array) {
      let objs = []
      model.map((item: Base.Objective) => {
        objs.push(plainToClass(ObjectBase, item.model()))
      })
      return objs
    }
    return plainToClass(ObjectBase, model.model())
  }
}

@ObjectType()
export class ObjectResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => ObjectBase, { nullable: true })
  data: ObjectBase;
}
@InputType()
export class InputCreateObject {
  @Field(() => CustomUUID)
  parentId: string;

  @Length(5, 50)
  @Field()
  name: string;

  @Length(5, 10)
  @Field()
  type: string;

  // @Field((type) => [InputCreateProperty], { nullable: true })
  // properties: [InputCreateProperty];
  createModel(): Objective.InputCreateObjective {
    let model = plainToClass(Objective.InputCreateObjective, this);
    // let properties = [];

    // this.properties?.map((obj) => {
    //   let p = plainToClass(PropertyBase, obj);
    //   properties.push(p);
    // });
    // model.properties = properties;
    return model;
  }
}
@InputType()
export class InputUpdateObject {
  @Field(() => CustomUUID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(5, 50)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(5, 10)
  type: string;

  @Field((type) => [CustomUUID], { nullable: true })
  children: [string];

  createModel(): Objective.InputUpdateObjective {
    let model = plainToClass(Objective.InputUpdateObjective, this);
    return model;
  }
}
