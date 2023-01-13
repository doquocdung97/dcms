import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(@Param() params: any, @Req() request: any) {
    return 'Hello World!';
  }
}
