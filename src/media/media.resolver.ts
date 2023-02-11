import {
  Args,
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  InputType,
} from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/auth/jwt-auth.guard';
import { CurrentUserGraphql } from 'src/auth/currentuser';
import { BaseMedia } from 'core/database';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { CustomUUID, BaseResult } from 'core/graphql';
import { InputUpdateMedia, InputCreateMedia } from 'core/graphql/media';
import { MediaResult, MediasResult, ResultCode } from 'core/graphql/media';
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

  @Mutation(() => MediaResult)
  async createMedia(@Args('input') input: InputCreateMedia) {
    /** now you have the file as a stream **/
    console.log(input);
    return new MediaResult();
  }
  @Mutation(() => MediasResult)
  async createMedias(
    @Args('input', { type: () => [InputCreateMedia] })
    inputs: InputCreateMedia[],
  ) {
    /** now you have the file as a stream **/
    console.log(inputs);
    return new MediasResult();
  }
  @Mutation(() => BaseMedia)
  async updateMedia(@Args('input') input: InputUpdateMedia) {
    /** now you have the file as a stream **/
    return false;
  }
  @Mutation((returns) => BaseResult)
  async deleteMedia(
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    return await this.mediaService.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreMedia(@Args('id') id: string) {
    return await this.mediaService.restore(id);
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
