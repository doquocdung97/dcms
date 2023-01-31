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
import { PropertyBase } from '../models/Property';

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<PropertyBase> {
    
  listenTo() {
    return PropertyBase;
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
  }

  /**
   * Called after entity update.
   */
  afterUpdate(event: UpdateEvent<any>) {
    let beforedata = event.databaseEntity;
    let afterdata = event.entity;
  }
}
