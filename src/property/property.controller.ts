import { Controller, Post, Req } from '@nestjs/common';
import { PropertyService } from './property.service';
import PropertyBase from 'src/database/models/Property';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  @Post('/update')
  async update(@Req() rep: any) {
    //var a = rep.body as PropertyBase;
    return await this.propertyService.update(rep.body);
  }
}
