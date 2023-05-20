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
import { MainProperty } from '../common';
import { PropertyBase } from '../models/Property';
import { ValueMedia } from '../models/ValueMedia';
import { ValueObject } from '../models/ValueObject';
import { ValueStandard } from '../models/ValueStandard';
import { Document } from 'src/core/base/document';
import { App } from 'src/core/base';
import { BaseDocument } from '../models/Document';
let mainproperty = new MainProperty()
@EventSubscriber()
export class PropertySubscriber
  implements EntitySubscriberInterface<PropertyBase>
{
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return PropertyBase;
  }
  // beforeUpdate(event: UpdateEvent<PropertyBase>) {
  //   console.log(`BEFORE ENTITY UPDATED: `, event.entity)
  // }

  async beforeInsert(event: InsertEvent<PropertyBase>) {
    let p = event.entity;
    let property = mainproperty.get(event.entity.type);
    if (property && property.dataInTable) {
      p.value = await property.setData(p, event.connection);
    }
  }
  async afterInsert(event: InsertEvent<PropertyBase>) {
    let p = event.entity;
    let property = mainproperty.get(event.entity.type);
    if (property && !property.dataInTable) {
      p.value = await property.setData(p, event.connection);
    }
  }
}

// @EventSubscriber()
// export class ValueStandardSubscriber implements EntitySubscriberInterface<ValueStandard> {
//   private _App: App
//   constructor() {
//     this._App = new App();
//   }
//   listenTo() {
//     return ValueStandard;
//   }

//   /**
//    * Called before entity update.
//    */
//   async beforeUpdate(event: UpdateEvent<ValueStandard>) {
//     // console.log(`BEFORE ENTITY UPDATED: `, event.entity)
//     // let model = event.entity;
//     // let database = event.manager.getRepository(BaseDocument)
//     // let doc_ = await database.findOne({
//     //   where: {
//     //     objects: {
//     //       properties: {
//     //         id: model.property.id
//     //       }
//     //     }
//     //   }
//     // })
//     // let doc = this._App.document(doc_?.id)
//     // if (doc) {
//     //   doc.onChange(model.property.parent, model.property.name, JSON.parse(model.value))
//     // }
//   }

//   /**
//    * Called after entity update.
//    */
//   afterUpdate(event: UpdateEvent<any>) {
//     // console.log(`AFTER ENTITY UPDATED: `, event.entity)
//   }
// }

// @EventSubscriber()
// export class PropertyAllSubscriber {
//   private _App: App
//   constructor() {
//     this._App = new App();
//   }
//   async afterInsert(event: InsertEvent<any>) {
//     this.onChange(event)
//   }
//   async afterUpdate(event: UpdateEvent<any>) {
//     this.onChange(event)
//   }
//   async onChange(event:any){
//     let model = event.entity;
//     if (model instanceof ValueStandard || model instanceof ValueObject || model instanceof ValueMedia) {
//       let database = event.manager.getRepository(BaseDocument)
//       let doc_ = await database.findOne({
//         where: {
//           objects: {
//             properties: {
//               id: model.property.id
//             }
//           }
//         }
//       })
//       let doc = this._App.document(doc_?.id)
//       if (doc) {
//         let property = model.property;
//         if(model instanceof ValueStandard){
//           doc.onChange(property.parent, property.name, JSON.parse(model?.value))
//         }else{
//           doc.onChange(property.parent, property.name, model.object)
//         }
//       }
//     }
//   }
// }