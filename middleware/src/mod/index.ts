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

class FieldClient {
  name: string;
  required: boolean;
  manylang: boolean;
  type: string;
  option: OptionClient;
  default: any;
}
class ObjectClient {
  name: string;
  type: string;
  fields: FieldClient[];
}

class GenerateTemplate{
  private _name: string;
  constructor(name) {

  }
  private getSchame(): ObjectClient {
    let path = join(__dirname, '..', 'src/mod')
    let fullname = join(path, this._name, 'schema.json')
    let rawdata = readFileSync(fullname);
    let schema = JSON.parse(rawdata.toString());
    return schema as ObjectClient;
  }
  create(){

  }
  get(){

  }
  update(){

  }
  delete(){

  }
  excute(){

  }
}