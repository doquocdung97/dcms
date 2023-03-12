import {
  InputType,
  registerEnumType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
import { BaseDocument, BaseResultCode, ObjectBase, PropertyBase } from 'core/database';
import {
  InputUpdateProperty,
  InputCreateProperty,
} from 'src/graphql/property/schema';
import { CustomUUID } from '../graphqlscalartype';

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
  documentId: string;

  @Length(5, 50)
  @Field()
  name: string;

  @Length(5, 10)
  @Field()
  type: string;

  @Field((type) => [InputCreateProperty], { nullable: true })
  properties: [InputCreateProperty];
  createModel() {
    let model = plainToClass(ObjectBase, this);
    let properties = [];

    this.properties?.map((obj) => {
      let p = plainToClass(PropertyBase, obj);
      properties.push(p);
    });
    model.properties = properties;
    let doc  = new BaseDocument()
    doc.id = this.documentId
    model.document = doc
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

  @Field((type) => [String], { nullable: true })
  children: [string];

  createModel() {
    let model = plainToClass(ObjectBase, this);
    let objs = [];

    this.children?.map((obj) => {
      let o = new ObjectBase();
      o.id = obj;
      objs.push(o);
    });
    // model.children = objs;
    return model;
  }
}
