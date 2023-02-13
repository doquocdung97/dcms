import {
  InputType,
  registerEnumType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { Length } from 'class-validator';
import { ObjectBase } from 'core/database';
import { InputUpdateProperty, InputCreateProperty } from 'src/graphql/property';
export enum ResultCode {
  /**
   * succses
   */
  B000,
  /**
   * failed
   */
  B001,
}
registerEnumType(ResultCode, {
  name: 'ResultCode',
  description: 'Object result code',
});

@ObjectType()
export class ObjectResult {
  @Field((type) => ResultCode, { defaultValue: ResultCode.B000 })
  code: ResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => ObjectBase, { nullable: true })
  data: ObjectBase;
}
@InputType()
export abstract class InputCreateObject {
  @Length(5, 50)
  @Field()
  name: string;

  @Field()
  type: string;

  @Field((type) => [InputCreateProperty], { nullable: true })
  properties: [InputCreateProperty];
}
