import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Param() params: any, @Req() request: any) {
    return this.appService.getHello();
  }
}
