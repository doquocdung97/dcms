import { UnauthorizedException } from '@nestjs/common';
import { BaseDocument, User, AuthContentDocument } from '../database';
import { resolve } from 'path';

export function handleUpdateJoinTable<T, B>(
  objects: B[],
  connects: T[],
  check: (item: T, objects: B[], index: number) => boolean,
  update: (item: T, object: B) => void,
  create: (object: B) => T,
) {
  let create_item: T[] = [];
  let update_item: T[] = [];
  let delete_item: T[] = [];
  let current_index = 0;
  connects.map((item: T, index: number) => {
    if (check(item, objects, index)) {
      update(item, objects[index]);
      update_item.push(item);
    } else {
      delete_item.push(item);
    }
    current_index = index + 1;
  });
  if (current_index < objects.length && delete_item.length == 0) {
    for (let i = current_index; i < objects.length; i++) {
      let element = objects[i];
      let rowdata = create(element);
      create_item.push(rowdata);
    }
  }
  return { create_item, update_item, delete_item };
}
export function parseBoolean(val: any): boolean {
  if (val == 'true' || val == '1' || val == 1) {
    return true;
  }
  return false;
}
export enum TypeFunction {
  QUERY,
  CREATE,
  EDIT,
  DELETE,
  SETTING,
}
export async function Authorization(
  user: User,
  type: TypeFunction,
  success: (autho: AuthContentDocument) => any,
  error: (e: any) => void = null,
) {
  if (!user.currentDoc) {
    throw new UnauthorizedException('Document not found');
  }
  let autho = user.currentDoc;
  let status = false;
  if (autho) {
    switch (type) {
      case TypeFunction.QUERY: {
        status = autho.query;
        break;
      }
      case TypeFunction.CREATE: {
        status = autho.create;
        break;
      }
      case TypeFunction.EDIT: {
        status = autho.edit;
        break;
      }
      case TypeFunction.DELETE: {
        status = autho.delete;
        break;
      }
      case TypeFunction.SETTING: {
        status = autho.setting;
        break;
      }
    }
  }
  if (!status) {
    throw new UnauthorizedException();
  }
  try {
    return await success(autho);
  } catch (ex) {
    if (error) error(ex);
  }
}
/**
 * @returns dir
 */
export const DirRoot: string = resolve(__dirname, "..", "..","..")

export function validateUUID(uuid: unknown): string | never {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    return null
  }
  return uuid;
}