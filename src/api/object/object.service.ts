import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { BaseDocument, ObjectBase, ObjectMain, PropertyBase, User, ValueObject } from 'core/database';
import { Authorization, LoggerHelper, TypeFunction } from 'core/common';
import { ObjectResult } from 'src/graphql/object/schema';
import { BaseResult, BaseResultCode } from 'src/graphql';
import { PropertyService } from '../property/property.service';
import { REQUEST } from '@nestjs/core';
import { DocumentService } from '../document/document.service';

@Injectable()
export class ObjectService {
  private logger = new LoggerHelper('ObjectService');
  constructor(
    @Inject(REQUEST)
    private request,
    @InjectRepository(ObjectMain)
    private objectmainRepository: Repository<ObjectMain>,

    @InjectRepository(ObjectBase)
    private objectRepository: Repository<ObjectBase>,
    private readonly propertyService: PropertyService,
    
    @InjectRepository(BaseDocument)
    private documentepository: Repository<BaseDocument>,
  ) { }
  async create(parentId: string, obj: ObjectBase): Promise<ObjectResult> {
    let result = new ObjectResult();
    let user = User.getByRequest(this.request)
    let doc = await this.documentepository.findOne({where:{id:obj.document?.id}})
    if(!doc){
      result.success = false;
      result.code = BaseResultCode.B002;
      return result
    }
    await Authorization(user, doc, TypeFunction.CREATE, async () => {
      let data = await this.objectRepository.save(obj);
      if (data && obj.properties) {
        let record = await this.propertyService.creates(
          data.id,
          data.properties,
        );
        if (record.success) {
          data.properties = record.data;
        }
      }
      var main = await this.objectmainRepository.create()
      main.detail = obj
      if (parentId) {
        let parent = new ObjectMain()
        parent.id = parentId
        main.parent = parent
        main.name = data.name
      }
      await this.objectmainRepository.save(main)
      result.data = data;
    }, (err) => {
      this.logger.error(
        `Create failed.\nWith info:\n${JSON.stringify(obj)}.\n${err}`,
      );
      result.success = false;
      result.code = BaseResultCode.B001;
    })
    return result;
  }
  async update(obj: ObjectBase): Promise<ObjectResult> {
    let result = new ObjectResult();
    let user = User.getByRequest(this.request)
    let data = await this.objectRepository.findOne({
      relations: {
        document: true
      },
      where: { id: obj.id }
    });
    await Authorization(user, data.document, TypeFunction.EDIT, async () => {
      result.data = await this.objectRepository.save(obj)
    }, (err) => {
      this.logger.error(
        `Update failed.\nWith info:\n${JSON.stringify(obj)}.\n${err}`,
      );
      result.success = false;
      result.code = BaseResultCode.B001;
    })
    return result;
  }

  async get(documentId: string, id: string) {
    let user = User.getByRequest(this.request)
    let doc = new BaseDocument()
    doc.id = documentId
    return await Authorization(user, doc, TypeFunction.QUERY, async () => {
      let option: FindManyOptions<ObjectBase> = {
        relations: {
          properties: {
            connectObject: true,
            connectMeida: true,
          },
        },
        select: {
          name: false,
        },
        where: {
          document: {
            id: documentId
          }
        }
      };
      if (id) {
        option.where = {
          id: id,
          document: {
            id: documentId
          }
        };
        let data = await this.objectRepository.findOne(option);
        return data;
      }
      let data = await this.objectRepository.find(option);
      return data;
    }, (ex) => {
      this.logger.error(
        `GET failed.\nWith info:\ndocumentId: ${documentId}\nid: ${id}.\n${ex}`,
      );
    })

  }
  async getTree(documentId: string) {
    //var data = await this.objectmainRepository.find({
    //  relations:{
    //    detail:true
    //  }
    //})
    var data = await this.objectmainRepository.manager.getTreeRepository(ObjectMain).findTrees()
    console.log(JSON.stringify(data))
    return data
  }
  async delete(id: string, softDelete = true): Promise<BaseResult> {
    let result = new BaseResult();
    let user = User.getByRequest(this.request)
    let data = await this.objectRepository.findOne({where:{id:id},relations:{document:true}})
    if (!data) {
      result.success = false;
      result.code = BaseResultCode.B002;
      return result
    }
    await Authorization(user, data.document, TypeFunction.DELETE, async () => {
      if (softDelete) {
        await this.objectRepository.softDelete({ id: id });
      } else {
        await this.objectRepository.delete({ id: id });
      }
    }, (ex) => {
      this.logger.error(`Delete failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    })
    return result;
  }
  async restore(id: string): Promise<BaseResult> {
    let result = new BaseResult();
    let user = User.getByRequest(this.request)
    let data = await this.objectRepository.findOne({where:{id:id},relations:{document:true}})
    if (!data) {
      result.success = false;
      result.code = BaseResultCode.B002;
      return result
    }
    await Authorization(user, data.document, TypeFunction.DELETE, async () => {
      await this.objectRepository.restore({ id: id });
    }, (ex) => {
      this.logger.error(`Restore failed.\n${ex}`);
      result.success = false;
      result.code = BaseResultCode.B001;
    })
    return result;
  }
}