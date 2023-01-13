import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PropertyService } from 'src/property/property.service';
import { PropertyBase, ValueMedia, BaseMedia } from 'core/database';
import { handleUpdateJoinTable } from 'core/common';
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
  getRepository() {
    return this.valueobjectRepository;
  }
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>,
    private propertyService: PropertyService,
    private valueMediaService: ValueMediaService,
  ) {}
  async save(data: BaseMedia) {
    let propertyRepository = this.propertyService.getRepository();
    let property = await propertyRepository.find({
      where: {
        id: In(data.properties),
      },
    });
    //console.log(property);
    let connectRepository = this.valueMediaService.getRepository();
    let connect = await connectRepository.find({
      relations: {
        property: true,
      },
      where: {
        //property: In(property.map(({ id }) => id)),
        object: {
          id: data.id,
        },
      },
    });
    let join = handleUpdateJoinTable<ValueMedia>(
      property,
      connect,
      (item, property) => {
        item.property.id = property.id;
        item.object = data;
      },
      (property: any) => {
        let newvalue = new ValueMedia();
        newvalue.property = property;
        newvalue.lang = String();
        newvalue.object = data;
        return newvalue;
      },
    );
    let rowdata = join.create_item.concat(join.update_item);
    connectRepository.save(rowdata);

    if (join.delete_item.length > 0) {
      connectRepository.remove(join.delete_item);
    }
    return await this.mediaRepository.save(data);
  }
  getRepository() {
    return this.mediaRepository;
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
