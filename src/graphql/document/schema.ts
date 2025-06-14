import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
import {
  AuthContentDocument,
  BaseDocument,
  BaseResultCode,
  InputRole,
  Role,
  User,
} from 'src/core/database';
import { CustomObject, CustomUUID } from '../graphqlscalartype';
import { DocumentResult as DocumentResultBase } from 'src/core/database/repository/DocumentRepository';
import { TypeFunction } from 'src/core/common';

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

  async createModel(): Promise<BaseDocument> {
    let model = plainToClass(BaseDocument, this);
    let auths = [];
    this.auths?.map((item) => {
      let user = new User();
      let auth = plainToClass(AuthContentDocument, item);
      delete auth['id'];
      user.id = item.id;
      auth.user = user;
      auths.push(auth);
    });
    model.auths = auths;
    return model;
  }
}

@InputType()
export class InputCreateDocument {
  @Length(5, 50)
  @Field()
  name: string;

  async createModel(): Promise<BaseDocument> {
    let model = plainToClass(BaseDocument, this);
    return model;
  }
}

@ObjectType()
export class DocumentResult implements DocumentResultBase {
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