import { Controller, Post, Req, Param, Get } from '@nestjs/common';
import { ObjectService } from './object.service';

@Controller('object')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}
  @Post('save')
  async save(@Req() rep: any) {
    //var data = await this.appService.create({
    //  name: 'dung',
    //});
    let { name } = rep.body;
    console.log(rep.body);
    var data = await this.objectService.create({
      name: name,
    });
    return data;
  }
  @Get()
  async getHello(@Param() params: any, @Req() request: any) {
    //console.log(request.params, request.query);
    const { id } = request.query;
    var data = await this.objectService.get(id);
    return data;
  }
}
