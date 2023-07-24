
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFileSync,
  rmSync,
  rm,
  writeFileSync,
  readFileSync,
  rename,
  access,
  constants,
  renameSync,

} from 'fs';
import { copy, copySync } from 'fs-extra';
import { LoggerHelper } from './loggerhelper';
import { join, basename, extname, dirname, resolve } from 'path';
import { Stream } from 'stream';
import { Variable } from "../constants";
export class FileHelper {
  private path = Variable.FORDER_FILE;
  private logger: LoggerHelper;
  constructor() {
    this.logger = new LoggerHelper(this.constructor.name);
  }
  /**
   *
   * @param path
   * @returns fullpath
   */
  createDir(filepath: string, hasfilename = true) {
    let path = this.parseUrl(filepath);;
    if (hasfilename) {
      path = dirname(path);
    }
    if (!existsSync(path)) {
      let paths = path.split('/');
      let new_path = String();
      paths.map((name, index) => {
        new_path = join(new_path, name);
        if (!existsSync(new_path)) {
          mkdirSync(new_path);
        }
      });
    }
    return filepath;
  }
  /**
   *
   * @param file
   * @returns fullpath
   */
  async upload(path: string, file: File) {
    try {
      this.logger.info(`Upload file: ${file.filename}`);
      let filepath = join(this.path, path, file.filename);

      filepath = this.createDir(filepath);
      var stream = createWriteStream(filepath);
      await new Promise((resolve, reject) => {
        stream.once('open', function (fd) {
          stream.write(file.buffer);
          stream.end();
          resolve(true);
        });
      });
      this.logger.info(`Upload file success - path: ${filepath}`);
      return filepath;
    } catch (error) {
      this.logger.error(`Upload file - error: ${error}`);
    }
    return;
  }
  delete(filePath: string) {
    try {
      this.logger.info(`Delete file - path: ${filePath}`);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        this.logger.info(`Delete file success`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Delete file - error: ${error}`);
    }
    return false;
  }
  async saveFile(filePath, data) {
    try {
      this.logger.info(`Save file - path: ${filePath}`);
      writeFileSync(filePath, data);
      return true;
    } catch (error) {
      this.logger.error(`Save file - error: ${error}`);
    }
    return false;
  }
  deleteDir(filePath) {
    try {
      this.logger.info(`Delete directory - path: ${filePath}`);
      rmSync(filePath, { recursive: true });
      return true;
    } catch (error) {
      this.logger.error(`Save directory - error: ${error}`);
    }
  }
  /**
   *
   * @param pathfile pathfile current
   * @param path to path
   * @param delete to true -> delete file current
   * @returns `boolean` true -> success, false -> failure
   */
  async copy(pathfile: string, path: string, isdelete: boolean = false) {
    try {
      this.logger.info(`Copy file - path: ${pathfile} to path: ${path}`);
      this.createDir(path);
      copyFileSync(pathfile, path);
      this.logger.info(`Copy file success`);
      if (isdelete) {
        this.delete(pathfile);
      }
      return true;
    } catch (error) {
      this.logger.error(`Copy file - error: ${error}`);
    }
    return false;
  }
  getFileName(path: string, type: boolean = false) {
    return getFileName(path, type);
  }
  getType(file: string) {
    let type = extname(file);
    return type.replace(/\./g, String());
  }
  joinpath(...path): string {
    return join(...path);
  }
  parseUrl(str: string): string {
    if (str) {
      str = str.replace(/\\/g, '/');
      return str
    }
  }
  readFile(path) {
    return readFileSync(path);
  }
  async copyFolder(source, destination): Promise<boolean> {
    try {
      this.logger.error(`Copy folder: ${source} to folder: ${destination}`);
      await copy(source, destination);
      return true
    } catch (err) {
      this.logger.error(`Copy folder - error: ${err}`);
    }
  }
  getPath(fullPath): string {
    return dirname(fullPath);
  }
  replaceFilename(fullPath, newFilename) {
    const directory = dirname(fullPath);
    const newFullPath = join(directory, newFilename);
    return newFullPath;
  }
}
export function getFileName(path: string, type: boolean = false) {
  if (type) {
    return basename(path);
  }
  var extension = extname(path);
  return basename(path, extension);
}

export class File {
  filename: string;
  mimetype: string;
  buffer: Buffer;
}
export class FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
  async buffer(): Promise<Buffer> {
    let stream = this.createReadStream();
    const buffer = await new Promise((resolve, reject) => {
      var buffers = [];
      stream.on('data', function (data) {
        buffers.push(data);
      });
      stream.on('end', function () {
        const everything = Buffer.concat(buffers);
        resolve(everything);
      });
      stream.on('error', function (e) {
        reject(e);
      });
    });
    return buffer as Buffer;
  }
  async toFile(): Promise<File> {
    let file = new File();
    file.filename = this.filename;
    file.mimetype = this.mimetype;
    file.buffer = await this.buffer();
    return file;
  }
}
export class FileAPI {
  originalname: string;
  mimetype: string;
  encoding: string;
  buffer: Buffer;
  size: number;
  toFile(): File {
    let file = new File();
    file.filename = this.originalname;
    file.mimetype = this.mimetype;
    file.buffer = this.buffer;
    return file;
  }
}
