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
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { BaseResultCode } from 'src/core/database';

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
export class BaseResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  //@Field({ nullable: true })
  //message: string;
}
