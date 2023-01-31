import { checkChangeData, FileHelper } from 'core/common';
import { MediaConfig } from 'src/Constants';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  TransactionCommitEvent,
  TransactionRollbackEvent,
  TransactionStartEvent,
  UpdateEvent,
} from 'typeorm';
import { History } from '../models/History';
import { BaseMedia } from '../models/Media';
import { User } from '../models/User';

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<BaseMedia> {
  private filehelper = new FileHelper();
  listenTo() {
    return BaseMedia;
  }
  /**
   * Called after entity is loaded.
   */
  afterLoad(entity: any) {
    //console.log(`AFTER ENTITY LOADED: `, entity);
  }

  /**
   * Called before post insertion.
   */
  beforeInsert(event: InsertEvent<any>) {
    //console.log(`BEFORE POST INSERTED: `, event.entity);
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<any>) {
    //console.log(`AFTER ENTITY INSERTED: `, event.entity);
  }

  /**
   * Called before entity update.
   */
  async beforeUpdate(event: UpdateEvent<any>) {
    //console.log(`AFTER ENTITY UPDATED: `, event.databaseEntity);
    //console.log(`AFTER ENTITY UPDATED: `, event.entity);

    //event.entity.name = 'dung test';

    let new_data = event.entity;
    let beforedata = event.databaseEntity;
    return;
  }

  /**
   * Called after entity update.
   */
  afterUpdate(event: UpdateEvent<any>) {
    //console.log(`AFTER ENTITY UPDATED: `, event.databaseEntity);
    //console.log(`AFTER ENTITY UPDATED: `, event.entity);

    var historyRepository = event.connection.getRepository(History);
    let beforedata = event.databaseEntity;
    let afterdata = event.entity;
    let datachange = checkChangeData(beforedata, afterdata);
    let history = new History();
    history.command = JSON.stringify(datachange);
    history.code = '001';
    history.media = afterdata as BaseMedia;
    history.user = event.queryRunner.data as User;
    historyRepository.save(history);
  }
}
