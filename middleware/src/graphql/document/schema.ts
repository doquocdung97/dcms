import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
  createUnionType
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
import {
  BaseResultCode,
  InputRole,
  Role
} from 'cms';
import { CustomObject, CustomUUID } from '../graphqlscalartype';
import { TypeFunction, Models, Document } from 'cms';
import { User } from '../user/schema';

const AuthContentDocument = createUnionType({
  name: 'AuthDocument',
  types: () => [TokenAuthContentDocument, UserAuthContentDocument] as const,
  resolveType: (e) => {
    if (e.token)
      return TokenAuthContentDocument.name
    else
      return UserAuthContentDocument.name
  }
});
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
  auths: typeof AuthContentDocument[];
}

@ObjectType()
export class BaseAuthContentDocument {

  //@Field(() => BaseDocument)
  //document: BaseDocument;
  @Field()
  id: number;

  @Field()
  name: string;

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

}
@ObjectType()
export class UserAuthContentDocument extends BaseAuthContentDocument {
  @Field(() => User)
  user: User;
}
@ObjectType()
export class TokenAuthContentDocument extends BaseAuthContentDocument {
  @Field()
  token: string;
}
@InputType()
export class BaseAuth {
  @Field()
  name: string;

  @Field(() => InputRole, { nullable: true })
  role: InputRole;
}

@InputType()
export class UserAuth extends BaseAuth {
  @Field(() => CustomUUID)
  userId: string;
  createModel(): Document.UserAuth {
    let model = plainToClass(Document.UserAuth, this);
    return model;
  }
}

@InputType()
export class TokenAuth extends BaseAuth {
  createModel(): Document.TokenAuth {
    let model = plainToClass(Document.TokenAuth, this);
    return model;
  }
}

const InputAuth = createUnionType({
  name: 'InputAuth',
  types: () => [UserAuth, TokenAuth],
});

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
export class TokenAuthResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  @Field({ nullable: true })
  data: TokenAuthContentDocument;
}
@ObjectType()
export class UserAuthResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  @Field({ nullable: true })
  data: UserAuthContentDocument;
}

@ObjectType()
export class DocumentResult {
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