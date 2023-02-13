import { CustomObject, CustomUUID } from 'src/graphql';
import { TypeProperty } from 'core/database';
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
import { PropertyBase } from 'core/database';
@InputType()
export class InputUpdateProperty {
  @Field()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(5)
  @MaxLength(50)
  name?: string;

  @Field((type) => TypeProperty, { nullable: true })
  type: TypeProperty;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: number;

  @Field((type) => CustomObject, { nullable: true })
  value: any;
}

@InputType()
export class InputCreateProperty {
  @Field()
  @MinLength(5)
  @MaxLength(50)
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
export enum ResultCode {
  /**
   * succses
   */
  B000,
  /**
   * failed
   */
  B001,
  /**
   * item not found
   */
  B002,
}
registerEnumType(ResultCode, {
  name: 'PropertyResultCode',
  description: 'Property result code',
});

@ObjectType()
export class PropertyResult {
  @Field((type) => ResultCode, { defaultValue: ResultCode.B000 })
  code: ResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => PropertyBase, { nullable: true })
  data: PropertyBase;
}

@ObjectType()
export class PropertiesResult {
  @Field((type) => ResultCode, { defaultValue: ResultCode.B000 })
  code: ResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => [PropertyBase], { nullable: true })
  data: PropertyBase[];
}
