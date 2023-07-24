import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  RecoverEvent,
  RemoveEvent,
  SoftRemoveEvent,
  TransactionCommitEvent,
  TransactionRollbackEvent,
  TransactionStartEvent,
  UpdateEvent,
} from 'typeorm';
import { BaseMedia } from '../models/Media';
import { App } from '../../base';
import { Variable } from '../../constants';

@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<BaseMedia> {
  // private _App: App
  // constructor() {
  //   this._App = new App();
  // }
  listenTo() {
    return BaseMedia;
  }
  // afterLoad(entity: BaseMedia, event?: LoadEvent<BaseMedia>){
  //   console.log("afterLoad",entity,event)
  // }
	// beforeSoftRemove(event: SoftRemoveEvent<BaseMedia>){
	// 	console.log(event)
	// }
	
	// afterSoftRemove(event: SoftRemoveEvent<BaseMedia>){
	// 	console.log(event)
	// }
  
}