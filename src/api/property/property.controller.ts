import { Controller, Inject, Post, Req } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import PropertyRepository from 'src/core/database/repository/PropertyRepository';

@Controller('property')
export class PropertyController {
  private _repository: PropertyRepository
  constructor(
    @Inject(REQUEST)
    private request
  ) {
    this._repository = new PropertyRepository(request)
  }
  @Post('/update')
  async update(@Req() rep: any) {
    //var a = rep.body as PropertyBase;
    return await this._repository.update(rep.body);
  }
}
