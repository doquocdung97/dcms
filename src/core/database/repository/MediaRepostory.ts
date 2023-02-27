import { DeepPartial, EntityRepository, Repository } from 'typeorm';
import { BaseMedia } from '../models/Media';


//@EntityRepository(BaseMedia)
export class MediaRepository extends Repository<BaseMedia> {
  create(): BaseMedia;
  create(entityLikeArray: DeepPartial<BaseMedia>[]): BaseMedia[];
  create(entityLike: DeepPartial<BaseMedia>): BaseMedia;
  create(entityLike?: unknown): BaseMedia | BaseMedia[] {
    return null
  }
}