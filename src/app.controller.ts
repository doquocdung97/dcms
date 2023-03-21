import {
  Controller,
  Get,
  Redirect
} from '@nestjs/common';
import { AppService } from './app.service';
import { Config } from './constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Redirect(Config.REDIRECT_URL)
  @Get()
  async get() {
    return null;
  }
}
