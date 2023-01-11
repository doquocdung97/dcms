import { Controller, Post, Req, Get } from '@nestjs/common';
import { MediaService } from './media.service';
import { get } from 'https';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('/update')
  async update(@Req() rep: any) {
    //var a = rep.body as PropertyBase;
    return await this.mediaService.save(rep.body);
  }
  @Get()
  async get(@Req() rep: any) {
    //var a = rep.body as PropertyBase;
    return await this.mediaService.get(rep.body);
  }
}
