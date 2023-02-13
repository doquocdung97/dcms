import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { BaseMedia, PropertyBase } from 'core/database';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CustomUUID } from 'src/graphql';
import { FileUpload, getFileName } from 'core/common';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';

@InputType()
export class InputUpdateMedia {
  @Field((type) => CustomUUID)
  id: string;

  @IsOptional()
  @Length(5, 50)
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  public: boolean;

  @Field(() => [Number], { nullable: true })
  properties: number[];

  @Field(() => GraphQLUpload, { nullable: true })
  file: Promise<FileUpload>;

  async createModel(): Promise<BaseMedia> {
    let model = plainToClass(BaseMedia, this);
    let file = await this.file;
    if (file) {
      let fileUpload = plainToClass(FileUpload, file);
      model.file = await fileUpload.toFile();
    }
    if (this.properties) {
      let properties = [];
      this.properties?.map((id) => {
        let property = new PropertyBase();
        property.id = id;
        properties.push(property);
      });
      model.properties = properties;
    }

    return model;
  }
}
@InputType()
export class InputCreateMedia {
  @IsOptional()
  @Length(5, 50)
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true, defaultValue: true })
  public: boolean;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;

  @Field(() => [Number], { nullable: true })
  properties: number[];

  async createModel(): Promise<BaseMedia> {
    let model = new BaseMedia();
    model.name = this.name;
    let file = await this.file;
    if (file) {
      if (!this.name) {
        model.name = getFileName(file.filename);
      }
      let fileUpload = plainToClass(FileUpload, file);
      model.file = await fileUpload.toFile();
    }
    model.public = this.public;
    let properties = [];
    this.properties?.map((id) => {
      let property = new PropertyBase();
      property.id = id;
      properties.push(property);
    });
    model.properties = properties;
    return model;
  }
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
