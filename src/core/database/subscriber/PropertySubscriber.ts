import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { MainProperty } from '../common';
import { PropertyBase } from '../models/Property';
import { ValueMedia } from '../models/ValueMedia';
import { ValueObject } from '../models/ValueObject';

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
  async beforeInsert(event: InsertEvent<PropertyBase>) {
    let p = event.entity;
    let property = MainProperty.get(event.entity.type);
    if (property && property.dataInTable) {
      p.value = await property.set(p, event.connection);
    }
  }
  async afterInsert(event: InsertEvent<PropertyBase>) {
    let p = event.entity;
    let property = MainProperty.get(event.entity.type);
    if (property && !property.dataInTable) {
      p.value = await property.set(p, event.connection);
    }
  }
}
