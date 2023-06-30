import { join, basename, extname, dirname } from 'path';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFileSync,
  readFileSync,
  readFile
} from 'fs';
class OptionClient {
  max: number;
  min: number;
  map: string;
}

export class FieldClient {
  name: string;
  required: boolean;
  manylang: boolean;
  type: string;
  option: OptionClient;
  default: any;
  input:boolean = true;
}
export class ObjectClient {
  name: string;
  type: string;
  fields: FieldClient[];
}

export class GenerateTemplate {
  private _name: string;
  private _id: string;
  private _path: string;
  constructor(id: string, name: string,path:string) {
    this._name = name
    this._id = id
    this._path = path
  }
  getSchame(): ObjectClient {
    // let path = join(__dirname, '..', '..', 'mod')
    let fullname = join(this._path,this._name, 'schema.json')
    let rawdata = readFileSync(fullname);
    let schema = JSON.parse(rawdata.toString());
    return schema as ObjectClient;
  }
  create() {

  }
  get() {

  }
  update() {

  }
  delete() {

  }
  excute() {

  }
}