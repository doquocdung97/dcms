import { Controller, Post, Req, Param, Get, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import ObjectRepository from 'src/core/database/repository/ObjectRepository';

@Controller('object')
export class ObjectController {
  private _repository: ObjectRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    this._repository = new ObjectRepository(request)
  }
  @Post('save')
  async save(@Req() rep: any) {
    //var data = await this.appService.create({
    //  name: 'dung',
    //});
    //let { name } = rep.body;
    //console.log(rep.body);
    //var data = await this.objectService.create({
    //  name: name,
    //});
    //return data;
  }
  @Get()
  async getHello(@Param() params: any, @Req() request: any) {
    //console.log(request.params, request.query);
    const { id } = request.query;
    var data = await this._repository.get(id);
    return data;
  }
}
