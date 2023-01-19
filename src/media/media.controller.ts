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
import { FileHelper, parseBoolean } from 'core/common';
import { BaseMedia } from 'core/database';
import { diskStorage } from 'multer';
import { Config } from 'src/Constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/currentuser';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  filehelper = new FileHelper();
  constructor(private readonly mediaService: MediaService) {}

  @Post('/update')
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: any, @Body() body) {
    let rowdata = body;
    rowdata.public = parseBoolean(rowdata.public);

    rowdata.file = file;
    let result = await this.mediaService.save(rowdata);
    return result;
  }

  @Get()
  async get(@Req() rep: any) {
    return await this.mediaService.get(rep.body);
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
