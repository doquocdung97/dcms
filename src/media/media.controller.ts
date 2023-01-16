import {
  Controller,
  Post,
  Req,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpStatus,
  Res,
  Param,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileHelper } from 'core/common';
import { BaseMedia } from 'core/database';
import { diskStorage } from 'multer';
import { Config } from 'src/Constants';

@Controller('media')
export class MediaController {
  filehelper = new FileHelper();
  constructor(private readonly mediaService: MediaService) {}
  @Post('/update')
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: any, @Body() body) {
    let rowdata = body;
    rowdata.public = rowdata.public == 'true' ? true : false;
    //let path = this.filehelper.setDir(rowdata.public ? 'public' : 'private');
    //let pathfile = this.filehelper.set(path, file);
    //if (pathfile) {
    //  rowdata.url = pathfile;
    //}
    rowdata.file = file;
    //let data = Object.assign(new BaseMedia(), rowdata);
    let result = await this.mediaService.save(rowdata);
    return result;
  }
  @Get()
  async get(@Req() rep: any) {
    //var a = rep.body as PropertyBase;
    return await this.mediaService.get(rep.body);
  }
  @Get('/:file')
  async getfile(@Res() res, @Param('file') filename) {
    //var a = rep.body as PropertyBase;
    let data = await this.mediaService.getByUrl('media/' + filename);
    console.log(data);
    if (data && data.public) {
      res.sendFile(filename, { root: './media/private' });
      return;
    }
    res.status(HttpStatus.NOT_FOUND).send();
    //return id;
  }
}
