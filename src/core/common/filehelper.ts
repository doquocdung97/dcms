import { MediaConfig } from 'src/Constants';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFile,
  copyFileSync,
} from 'fs';
import { LoggerHelper } from 'core/common';
import { join, basename, extname, dirname } from 'path';

export class FileHelper {
  private path = MediaConfig.FORDER_FILE;
  private logger = new LoggerHelper('FileHelper');
  constructor() {}
  /**
   *
   * @param path
   * @returns fullpath
   */
  createDir(filepath: string) {
    let path = dirname(filepath);
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
  upload(path: string, file: any) {
    try {
      this.logger.info(`Upload file: ${file.originalname}`);
      let filepath = join(this.path, path, file.originalname);

      filepath = this.createDir(filepath);
      var stream = createWriteStream(filepath);
      stream.once('open', function (fd) {
        stream.write(file.buffer);
        stream.end();
      });
      let pathfile = filepath.replace(/\\/g, '/');
      this.logger.info(`Upload file success - path: ${pathfile}`);
      return pathfile;
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
  /**
   *
   * @param pathfile pathfile current
   * @param path to path
   * @param delete to true -> delete file current
   * @returns boolean true -> success, false -> failure
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
    if (type) {
      return basename(path);
    }
    var extension = extname(path);
    return basename(path, extension);
  }
  getType(file: string) {
    return extname(file);
  }
  joinpath(...path) {
    return join(...path);
  }
}
