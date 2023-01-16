import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PropertyService } from 'src/property/property.service';
import { PropertyBase, ValueMedia, BaseMedia } from 'core/database';
import { FileHelper, handleUpdateJoinTable } from 'core/common';
import { Config } from 'src/Constants';
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
interface InputMedia {
  id: string;
  name: string;
  public: boolean;
  file: any;
  properties: number[];
}

@Injectable()
export class MediaService {
  private filehelper = new FileHelper();
  constructor(
    @InjectRepository(BaseMedia)
    private mediaRepository: Repository<BaseMedia>,
    private propertyService: PropertyService,
    private valueMediaService: ValueMediaService,
  ) {}
  async save(inputdata: InputMedia) {
    let new_data = Object.assign(new BaseMedia(), inputdata);
    if (inputdata.file) {
      let path = this.filehelper.setDir(
        inputdata.public ? 'public' : 'private',
      );
      let pathfile = this.filehelper.set(path, inputdata.file);
      if (pathfile) {
        new_data.url = pathfile;
      }
    }
    delete new_data['file'];
    let data: BaseMedia = new_data;
    if (inputdata.properties) {
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
      let join = handleUpdateJoinTable<ValueMedia, PropertyBase>(
        property,
        connect,
        (item, properties, index) => {
          return (
            item['property'] &&
            item['property']['id'] &&
            index < properties.length
          );
        },
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
    }
    let beforedata = null;
    if (data.id) {
      beforedata = await this.mediaRepository.findOneBy({ id: data.id });
    }
    if (beforedata) {
      if (inputdata.file && beforedata.url != data.url) {
        this.filehelper.delete(beforedata.url);
      } else if (beforedata.public != data.public) {
        let filename = this.filehelper.getFileName(beforedata.url, true);
        let afterurl = this.filehelper.joinpath(
          Config.FORDER_FILE,
          data.public ? Config.FORDER_FILE_PUBLIC : Config.FORDER_FILE_PRIVATE,
          filename,
        );
        let befoerurl = beforedata.url;
        if (beforedata.public) {
          befoerurl = this.filehelper.joinpath(Config.FORDER_FILE, befoerurl);
        }
        let statuscopy = await this.filehelper.copy(befoerurl, afterurl);
        if (statuscopy) {
          this.filehelper.delete(befoerurl);
          data.url = afterurl;
        } else {
          data.public = beforedata.public;
        }
      }
    }
    if (data.public) {
      data.url = data.url.replace(Config.FORDER_FILE, String());
    }
    let afterdata = await this.mediaRepository.save(data);

    return afterdata;
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
  async getByUrl(url: string) {
    return await this.mediaRepository.findOneBy({ url: url });
  }
}
