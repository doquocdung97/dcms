import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import BaseMedia from 'src/database/models/Media';
import { PropertyService } from 'src/property/property.service';
import ValueMedia from 'src/database/models/ValueMedia';
import PropertyBase from 'src/database/models/Property';
@Injectable()
export class ValueMediaService {
  constructor(
    @InjectRepository(ValueMedia)
    private valueobjectRepository: Repository<ValueMedia>,
  ) {}
  async saves(data: ValueMedia[]): Promise<ValueMedia[]> {
    return await this.valueobjectRepository.save(data);
  }
  async save(data: ValueMedia) {
    return await this.valueobjectRepository.save(data);
  }
  async get(data: any) {
    if (data.id) {
      return await this.valueobjectRepository.findOneBy({ id: data.id });
    }
    return await this.valueobjectRepository.find();
  }
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>,
    private propertyRepository: PropertyService,
    private valueMediaRepository: ValueMediaService,
  ) {}
  async save(data: BaseMedia) {
    if (data.id) {
      if (data.connect) {
        let contents = await this.valueMediaRepository.get({});
        data.connect = contents as ValueMedia[];
      } else {
        let content = new ValueMedia();
        let property = await this.propertyRepository.get({ id: 13 });
        content.object = data;
        content.property = property as PropertyBase;
        await this.valueMediaRepository.save(content);
        data.connect = [content];
      }
    }
    return await this.mediaRepository.save(data);
  }
  async get(data: any) {
    if (data.id) {
      return await this.mediaRepository.findOneBy({ id: data.id });
    }
    return await this.mediaRepository.find({
      relations: {
        connect: {
          property: true,
        },
      },
    });
  }
}
