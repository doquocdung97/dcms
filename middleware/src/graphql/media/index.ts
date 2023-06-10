import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { BaseResult } from 'src/graphql';
import {
  InputUpdateMedia,
  InputCreateMedia,
  MediaResult,
  MediasResult,
  BaseMedia
} from './schema';
import { plainToClass } from 'class-transformer';
import { CurrentUserGraphql, JwtAuthGuardGraphql } from '../user/guard';
import { User } from 'cms';

@UseGuards(JwtAuthGuardGraphql)
@Resolver(() => BaseMedia)
export class MediaResolver {

  @Query(() => BaseMedia, { nullable: true })
  async media(@CurrentUserGraphql() user: User.User, @Args('id') id: string) {
    let doc = user.activeDocument();
    let media = await doc.media(id);
    return plainToClass(BaseMedia, media.model());
  }

  @Query(() => [BaseMedia], { nullable: true })
  async medias(@CurrentUserGraphql() user: User.User) {
    let doc = user.activeDocument();
    let medias = await doc.medias();
    let list = [];
    medias.map(media => {
      list.push(Object.assign(new BaseMedia(), media.model()));
    })
    return list;
  }

  @Mutation(() => MediaResult)
  async createMedia(@CurrentUserGraphql() user: User.User, @Args('input') input: InputCreateMedia) {
    let result = new MediaResult();
    try {
      input = plainToClass(InputCreateMedia, input);
      let doc = user.activeDocument();
      let model = await input.createModel();
      let media = await doc.createMedia(model);
      result.data = plainToClass(BaseMedia, media.model());
    } catch (error) {
      console.log(error)
    }

    return result;
  }

  @Mutation(() => MediasResult)
  async createMedias(
    @CurrentUserGraphql() user: User.User,
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
    let result = new MediasResult();
    let doc = user.activeDocument();
    let medias = await doc.createMedias(models)
    let list = [];
    medias.map(media => {
      list.push(Object.assign(new BaseMedia(), media.model()));
    })
    result.data = list
    return result;
  }

  @Mutation(() => MediaResult)
  async updateMedia(@CurrentUserGraphql() user: User.User, @Args('input') input: InputUpdateMedia) {
    input = plainToClass(InputUpdateMedia, input);
    let model = await input.createModel();
    let result = new MediaResult();
    let doc = user.activeDocument();
    let media = await doc.media(input.id, false)
    let data = await media.update(model)
    if (data) {
      result.data = plainToClass(BaseMedia, media.model())
    }
    return result
  }
  @Mutation(() => BaseResult)
  async deleteMedia(
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    // return await this._repository.delete(id, soft);
  }
  @Mutation((returns) => BaseResult)
  async restoreMedia(@Args('id') id: string) {
    // return await this._repository.restore(id);
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
