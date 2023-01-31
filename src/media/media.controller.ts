import {
  Controller,
  Post,
  Req,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpStatus,
  Res,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileHelper, parseBoolean } from 'core/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/currentuser';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  filehelper = new FileHelper();
  constructor(private readonly mediaService: MediaService) {}

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: any, @Body() body) {
    let rowdata = body;
    rowdata.public = parseBoolean(rowdata.public);
    rowdata.file = file;
    let result = await this.mediaService.save(rowdata);
    return result;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: any, @Body() body) {
    let rowdata = body;
    rowdata.public = parseBoolean(rowdata.public);
    rowdata.file = file;
    delete rowdata['id'];
    let result = await this.mediaService.save(rowdata);
    return result;
  }

  @Get()
  async get(@Req() rep: any) {
    const { id } = rep.query;
    return await this.mediaService.get({ id });
  }

  @Delete()
  async delete(@Req() rep: any) {
    const { id } = rep.query;
    let ids = [];
    if (id) {
      ids = id.split(',');
    }
    return await this.mediaService.delete(ids);
  }
  @Put('restore')
  async restore(@Req() rep: any) {
    const { id } = rep.query;
    let ids = [];
    if (id) {
      ids = id.split(',');
    }
    return await this.mediaService.restore(ids);
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
