import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
import {
  BaseResultCode,
  InputRole,
  Role
} from 'cms';
import { CustomObject, CustomUUID } from '../graphqlscalartype';
import { TypeFunction,Models,Document} from 'cms';
import { User } from '../user/schema';

@ObjectType()
export class BaseDocument {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [AuthContentDocument], { defaultValue: [] })
  auths: AuthContentDocument[];
}

@ObjectType()
export class AuthContentDocument {

  //@Field(() => BaseDocument)
  //document: BaseDocument;

  @Field(() => Role)
  role: Role;

  @Field()
  query: boolean;

  @Field()
  create: boolean;

  @Field()
  edit: boolean;

  @Field()
  setting: boolean;

  @Field()
  delete: boolean;

  @Field(() => User)
  user: User;
}

@InputType()
export class UserAuth {
  @Field(() => CustomUUID)
  id: string;

  @Field(() => InputRole, { nullable: true })
  role: InputRole;

  @Field({ nullable: true })
  query: boolean;

  @Field({ nullable: true })
  create: boolean;

  @Field({ nullable: true })
  edit: boolean;

  @Field({ nullable: true })
  setting: boolean;

  @Field({ nullable: true })
  delete: boolean;
}
@InputType()
export class InputUpdateDocument {
  @Field((type) => CustomUUID)
  id: string;

  @IsOptional()
  @Length(5, 50)
  @Field({ nullable: true })
  name: string;

  @Field(() => [UserAuth], { nullable: true })
  auths: UserAuth[];

  createModel(): Document.InputUpdateDocument {
    delete this.id
    let model = plainToClass(Document.InputUpdateDocument, this);
    return model;
  }
}

@InputType()
export class InputCreateDocument {
  @Length(5, 50)
  @Field()
  name: string;

  async createModel(): Promise<Document.InputCreateDocument> {
    let model = plainToClass(Document.InputCreateDocument, this);
    return model;
  }
}

@ObjectType()
export class DocumentResult{
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  @Field((type) => BaseDocument, { nullable: true })
  data: BaseDocument;
}

@ObjectType()
export class DocumentsResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => [BaseDocument], { nullable: true })
  data: BaseDocument[];
}

@ObjectType()
export class AcitveDocumentResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  @Field({ nullable: true })
  token: string;

  @Field((type) => BaseDocument, { nullable: true })
  data: BaseDocument;
}

registerEnumType(Role, {
  name: 'ResponseRole',
  description: 'Response Role user',
});
registerEnumType(InputRole, {
  name: 'InputRole',
  description: 'Input Role user',
});

registerEnumType(TypeFunction, {
  name: 'EventType',
  // description: 'Response Role user',
})

@ObjectType()
export class CommandDocument {
  @Field()
  key: string;

  @Field()
  cmd: string;

  @Field(() => TypeFunction)
  event: TypeFunction;

  @Field((type) => CustomObject, { nullable: true })
  value: any;
}