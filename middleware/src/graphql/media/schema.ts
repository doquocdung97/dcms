import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
// import { BaseMedia, BaseResultCode, PropertyBase } from 'core/database';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import {  CustomUUID } from 'src/graphql';
import {Media as MediaCMS,Extensions,BaseResultCode} from 'cms';
import { plainToClass } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';
import { User } from '../user/schema';
import {PropertyBase} from '../property/schema'
@ObjectType()
export class PropertyMedia {
  @Field((type) => CustomUUID)
  id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  public: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deleteAt: Date;
}

@ObjectType()
export class BaseMedia extends PropertyMedia{
  @Field()
  user: User;

  @Field((type) => [PropertyBase], { defaultValue: [] })
  properties: PropertyBase[];
}

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
  file: Promise<MediaCMS.FileUpload>;
  /**
   * Design Pattern
   * Structural Pattern - Adapter Pattern
   */
  async createModel(): Promise<MediaCMS.InputUpdateMedia> {
    let model = plainToClass(MediaCMS.InputUpdateMedia, this);
    let file = await this.file;
    if (file) {
      let fileUpload = plainToClass(MediaCMS.FileUpload, file);
      model.file = await fileUpload.toFile();
    }
    // if (this.properties) {
    //   let properties = [];
    //   this.properties?.map((id) => {
    //     let property = new PropertyBase();
    //     property.id = id;
    //     properties.push(property);
    //   });
    //   model.properties = properties;
    // }

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
  file: Promise<MediaCMS.FileUpload>;

  @Field(() => [Number], { nullable: true })
  properties: number[];

  async createModel(): Promise<MediaCMS.InputCreateMedia> {
    let model = new MediaCMS.InputCreateMedia();
    model.name = this.name;
    let file = await this.file;
    if (file) {
      if (!this.name) {
        model.name = Extensions.getFileName(file.filename);
      }
      let fileUpload = plainToClass(MediaCMS.FileUpload, file);
      model.file = await fileUpload.toFile();
    }
    model.public = this.public;
    // let properties = [];
    // this.properties?.map((id) => {
    //   let property = new PropertyBase();
    //   property.id = id;
    //   properties.push(property);
    // });
    // model.properties = properties;
    return model;
  }
}

@ObjectType()
export class MediaResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => BaseMedia, { nullable: true })
  data: BaseMedia;
}

@ObjectType()
export class MediasResult {
  @Field((type) => BaseResultCode, { defaultValue: BaseResultCode.B000 })
  code: BaseResultCode;

  @Field({ defaultValue: true })
  success: boolean;
  @Field((type) => [BaseMedia], { nullable: true })
  data: BaseMedia[];
}
