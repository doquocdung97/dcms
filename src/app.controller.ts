import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('save')
  async save(@Req() rep: any) {
    //var data = await this.appService.create({
    //  name: 'dung',
    //});
    let { name } = rep.body;
    console.log(rep.body);
    var data = await this.appService.create({
      name: name,
    });
    return data;
  }
  @Get()
  async getHello(@Param() params: any, @Req() request: any) {
    //console.log(request.params, request.query);
    const { id } = request.query;
    var data = await this.appService.get(id);
    return data;
  }
}
