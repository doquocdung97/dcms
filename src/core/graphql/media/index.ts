import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { BaseMedia } from 'core/database';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CustomUUID } from 'core/graphql';

@InputType()
export class InputUpdateMedia {
  @Field((type) => CustomUUID)
  id: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  public: boolean;

  @Field(() => GraphQLUpload, { nullable: true })
  image: Promise<any>;
}
@InputType()
export class InputCreateMedia {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true, defaultValue: true })
  public: boolean;

  @Field(() => GraphQLUpload)
  image: Promise<any>;
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
  name: 'MediaResultCode',
  description: 'Media result code',
});

@ObjectType()
export class MediaResult {
  @Field((type) => ResultCode, { defaultValue: ResultCode.B000 })
  code: ResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => BaseMedia, { nullable: true })
  data: BaseMedia;
}

@ObjectType()
export class MediasResult {
  @Field((type) => ResultCode, { defaultValue: ResultCode.B000 })
  code: ResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => [BaseMedia], { nullable: true })
  data: BaseMedia[];
}
