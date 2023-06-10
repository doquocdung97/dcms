import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  MinLength,
  MaxLength,
  Length,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { BaseResultCode, Models } from 'cms';
import { CustomUUID } from '../graphqlscalartype';
// import { UserResult as UserResultBase} from 'src/core/database/repository/UserRepository';
@InputType()
export class InputUpdateUser {
  @IsOptional()
  @Length(5, 50)
  @Field({ nullable: true })
  name: string;

  //@IsEmail()
  //@Field({ nullable: true })
  //email: string;

  @IsOptional()
  @Length(10, 11)
  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  password: string;
}
@InputType()
export class InputCreateUser {
  @Length(5, 50)
  @Field()
  name: string;

  @IsEmail()
  @Field()
  email: string;

  @IsOptional()
  @Length(10, 11)
  @Field()
  phone: string;

  @Field()
  password: string;
}

@InputType()
export class InputUser {
  @IsEmail()
  @Field()
  email: string;

  @Field()
  password: string;
}

// export enum ResultCode {
//   /**
//    * succses
//    */
//   B000,
//   /**
//    * failed
//    */
//   B001,
//   /**
//    * item not found
//    */
//   B002,
//   /**
//    * can't update item
//    */
//   B003,
//   /**
//    * email has in database
//    */
//   B004,
// }
// registerEnumType(ResultCode, {
//   name: 'UserResultCode',
//   description: 'User result code',
// });
@ObjectType()
export class User {
  @Field(() => CustomUUID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  token: string;

  @Field({ nullable: true })
  phone: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;

  @Field((type) => User, { nullable: true })
  data: User;
}
