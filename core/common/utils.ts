// import { BaseDocument, User, AuthContentDocument } from '../database';
import { User } from '../database/models/User';
import { AuthContentDocument } from '../database/models/Document';
import { resolve } from 'path';
import * as jwt from 'jsonwebtoken'
import { Config } from "../config";

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
export async function Authorization<T>(
  user: User,
  type: TypeFunction,
  success: (autho: AuthContentDocument) => Promise<T>,
  error: (e: any) => void = null,
){
  if (!user.currentDoc) {
    throw new TypeError('Document not found');
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
    throw new TypeError();
  }
  return await success(autho);
}
/**
 * @returns dir
 */
export const DirRoot: string = resolve(__dirname, "..", "..", "..")

export function validateUUID(uuid: unknown): string | never {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    return null
  }
  return uuid;
}

export class Token {
  private _config: Config
  private _option: any
//   {
//      expiresIn: '60s'
// }
  constructor(option = {}) {
    this._config = new Config();
    this._option = option;
  }
  get(data: any): string {
    let token = jwt.sign(data, this._config.get<string>("SECRET_KEY","SECRET_KEY"), this._option);
    return token
  }
  verify(val: string): any {
    let verify = jwt.verify(val, this._config.get<string>("SECRET_KEY","SECRET_KEY"));
    return verify
  }
}

export class BaseError extends Error {
  constructor (public status: number, public message: string = String()) {
      super();
  }
}
