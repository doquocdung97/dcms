import { Args, Parent, ResolveField, Resolver, Query } from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/auth/jwt-auth.guard';
import { CurrentUserGraphql } from 'src/auth/currentuser';
import { BaseMedia } from 'core/database';

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
  //@ResolveField()
  //async posts(@Parent() author) {
  //  const { id } = author;
  //  return this.mediaService.findAll({ authorId: id });
  //}
}
