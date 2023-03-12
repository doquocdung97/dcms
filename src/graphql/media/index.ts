import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import { BaseMedia } from 'core/database';
import { BaseResult } from 'src/graphql';
import {
  InputUpdateMedia,
  InputCreateMedia,
  MediaResult,
  MediasResult,
} from 'src/graphql/media/schema';
import { plainToClass } from 'class-transformer';
import MediaRepository from 'src/core/database/repository/MediaRepository';
import { REQUEST } from '@nestjs/core';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => BaseMedia)
export class MediaResolver {
  private _repository: MediaRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    this._repository = new MediaRepository(request)
  }

  @Query((returns) => BaseMedia, { nullable: true, name: 'media' })
  async getMedia(@Args('id') id: string) {
    var result = await this._repository.get({ id });
    return result;
  }

  @Query((returns) => [BaseMedia], { nullable: true, name: 'medias' })
  async getMedias() {
    var result = await this._repository.get();
    return result;
  }

  @Mutation(() => MediaResult)
  async createMedia(@Args('input') input: InputCreateMedia) {
    let data = plainToClass(InputCreateMedia, input);
    let model = await data.createModel();
    return await this._repository.create(model);
  }

  @Mutation(() => MediasResult)
  async createMedias(
    @Args('input', { type: () => [InputCreateMedia] })
    inputs: InputCreateMedia[],
  ) {
    let models = [];
    for (let index = 0; index < inputs.length; index++) {
      const input = inputs[index];
      let data = plainToClass(InputCreateMedia, input);
      let model = await data.createModel();
      models.push(model);
    }
    return await this._repository.creates(models);
  }
  @Mutation(() => MediaResult)
  async updateMedia(@Args('input') input: InputUpdateMedia) {
    let data = plainToClass(InputUpdateMedia, input);
    let model = await data.createModel();
    return await this._repository.update(model);
  }
  @Mutation((returns) => BaseResult)
  async deleteMedia(
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    return await this._repository.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreMedia(@Args('id') id: string) {
    return await this._repository.restore(id);
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
