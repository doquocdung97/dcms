import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { BaseResult } from 'src/graphql';
import {
  InputUpdateMedia,
  InputCreateMedia,
  MediaResult,
  MediasResult,
  Media
} from './schema';
import { plainToClass } from 'class-transformer';
import { CurrentUserGraphql, JwtAuthGuardGraphql } from '../user/guard';
import { BaseResultCode, User } from 'cms';

@UseGuards(JwtAuthGuardGraphql)
@Resolver(() => Media)
export class MediaResolver {

  @Query(() => Media, { nullable: true })
  async media(@CurrentUserGraphql() user: User.User, @Args('id') id: string) {
    const doc = user.activeDocument();
    const media = await doc.media(id);
    const schema = Media.create(media)
    return schema
  }

  @Query(() => [Media], { nullable: true })
  async medias(@CurrentUserGraphql() user: User.User) {
    const doc = user.activeDocument();
    const medias = await doc.medias();
    const schema = Media.create(medias);
    return schema;
  }

  @Mutation(() => MediaResult)
  async createMedia(@CurrentUserGraphql() user: User.User, @Args('input') input: InputCreateMedia) {
    const result = new MediaResult();
    try {
      input = plainToClass(InputCreateMedia, input);
      const doc = user.activeDocument();
      const model = await input.createModel();
      const media = await doc.createMedia(model);
      if(!media){
        result.code = BaseResultCode.B002;
        result.success = false; 
        return result
      }
      result.data = Media.create(media)
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
      const data = plainToClass(InputCreateMedia, input);
      const model = await data.createModel();
      models.push(model);
    }
    const result = new MediasResult();
    const doc = user.activeDocument();
    const medias = await doc.createMedias(models)
    result.data = Media.create(medias)
    return result;
  }

  @Mutation(() => MediaResult)
  async updateMedia(@CurrentUserGraphql() user: User.User, @Args('input') input: InputUpdateMedia) {
    input = plainToClass(InputUpdateMedia, input);
    const result = new MediaResult();
    try {
      const model = await input.createModel();
      
      const doc = user.activeDocument();
      const media = await doc.media(input.id, false)
      const data = await media.update(model)
      if (data) {
        result.data = Media.create(media)
      }
    } catch (error) {
      console.log(error)
    }
    return result
  }
  @Mutation(() => BaseResult)
  async deleteMedia(
    @CurrentUserGraphql() user: User.User,
    @Args('id') id: string,
    @Args('soft', { nullable: true, defaultValue: true }) soft: boolean,
  ) {
    const result = new BaseResult();
    const doc = user.activeDocument();
    const media = await doc.media(id, false)
    const status = await media.delete(soft)
    if(!status){
      result.code = BaseResultCode.B002;
      result.success = false;
    }
    return result;
  }
  @Mutation(() => BaseResult)
  async restoreMedia(@CurrentUserGraphql() user: User.User,@Args('id') id: string) {
    const result = new BaseResult();
    const doc = user.activeDocument();
    const media = await doc.media(id, false)
    const status = await media.restore()
    if(!status){
      result.code = BaseResultCode.B002;
      result.success = false;
    }
    return result;
  }
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
