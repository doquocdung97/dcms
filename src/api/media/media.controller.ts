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
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileAPI, FileHelper, parseBoolean } from 'core/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/currentuser';
import { plainToClass } from 'class-transformer';
import MediaRepository from 'src/core/database/repository/MediaRepository';
import { REQUEST } from '@nestjs/core';
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  filehelper = new FileHelper();
  private _repository: MediaRepository
  constructor(
    @Inject(REQUEST)
    private request
    ) {
      this._repository = new MediaRepository(request)
    }

  @Post('/update')
  @UseInterceptors(FileInterceptor('file'))
  async update(@UploadedFile() file: FileAPI, @Body() body) {
    let rowdata = body;
    rowdata.properties = JSON.parse(rowdata.properties);
    rowdata.public = parseBoolean(rowdata.public);

    rowdata.file = plainToClass(FileAPI, file).toFile();
    let result = await this._repository.update(rowdata);
    return result;
  }

  @Get()
  async get(@Req() request: any) {
    const { id } = request.query;
    return await this._repository.get({ id });
  }
  @Get('private/:file')
  async getfile(@Res() res, @Param('file') filename, @CurrentUser() user) {
    let data = await this._repository.getByUrl('private/' + filename);
    if (data) {
      res.sendFile(filename, { root: './media/private' });
      return;
    }
    res.status(HttpStatus.NOT_FOUND).send();
  }
}
