import { Args, Parent, ResolveField, Resolver, Query, Mutation, InputType } from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/auth/jwt-auth.guard';
import { CurrentUserGraphql } from 'src/auth/currentuser';
import { BaseMedia } from 'core/database';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CustomUUID } from 'core/common';

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
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => BaseMedia)
export class MediaResolver {
  constructor(private mediaService: MediaService) {}

  @Query((returns) => BaseMedia, { nullable: true, name: 'media' })
  async getMedia(@Args('id') id: string) {
    var result = await this.mediaService.get({ id });
    return result;
  }
  @Query((returns) => [BaseMedia], { nullable: true, name: 'medias' })
  async getMedias() {
    var result = await this.mediaService.get();
    return result;
  }

  @Mutation(() => BaseMedia)
  async createMedia(@Args('input') input: InputCreateMedia) {
    /** now you have the file as a stream **/
    console.log(input)
    return false;
  }
  @Mutation(() => [BaseMedia])
  async createMedias(
    @Args('input', { type: () => [InputCreateMedia] })
    inputs: InputCreateMedia[],
  ) {
    /** now you have the file as a stream **/
    console.log(inputs)
    return false;
  }
  @Mutation(() => BaseMedia)
  async updateMedia(@Args('input') input: InputUpdateMedia) {
    /** now you have the file as a stream **/
    return false;
  }
  
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
