import { Config } from 'src/Constants';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFile,
  copyFileSync,
} from 'fs';
import { join, basename, extname } from 'path';

export class FileHelper {
  private path = Config.FORDER_FILE;
  constructor(path: string = String()) {
    this.setDir(path);
  }
  /**
   *
   * @param path
   * @returns fullpath
   */
  setDir(path: string) {
    path = join(this.path, path);
    let paths = path.split('\\');
    let new_path = String();
    paths.map((name, index) => {
      new_path = join(new_path, name);
      if (!existsSync(new_path)) {
        mkdirSync(new_path);
      }
    });
    return new_path;
  }
  /**
   *
   * @param file
   * @returns fullpath
   */
  set(path: string, file: any) {
    try {
      let filepath = join(path || this.path, file.originalname);
      var stream = createWriteStream(filepath);
      stream.once('open', function (fd) {
        stream.write(file.buffer);
        stream.end();
      });
      return filepath.replace(/\\/g, '/');
    } catch (error) {}
    return;
  }
  delete(filePath: string) {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return true;
      }
    } catch (error) {}
    return false;
  }
  /**
   *
   * @param pathfile pathfile current
   * @param path to path
   * @returns boolean true -> success, false -> failure
   */
  async copy(pathfile: string, path: string) {
    try {
      copyFileSync(pathfile, path);
      return true;
    } catch (error) {
      console.log(error);
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
