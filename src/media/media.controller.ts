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
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileAPI, FileHelper, parseBoolean } from 'core/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/currentuser';
import { plainToClass } from "class-transformer";
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  filehelper = new FileHelper();
  constructor(private readonly mediaService: MediaService) {}

  @Post('/update')
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: FileAPI, @Body() body) {
    let rowdata = body;
    rowdata.properties = JSON.parse(rowdata.properties)
    rowdata.public = parseBoolean(rowdata.public);

    rowdata.file = plainToClass(FileAPI,file).toFile();
    let result = await this.mediaService.update(rowdata);
    return result;
  }

  @Get()
  async get(@Req() request: any) {
    const { id } = request.query;
    return await this.mediaService.get({ id });
  }
  @Get('private/:file')
  async getfile(@Res() res, @Param('file') filename, @CurrentUser() user) {
    let data = await this.mediaService.getByUrl('media/private/' + filename);
    if (data && data.user && user && data.user.id == user.id) {
      res.sendFile(filename, { root: './media/private' });
      return;
    }
    res.status(HttpStatus.NOT_FOUND).send();
  }
}
