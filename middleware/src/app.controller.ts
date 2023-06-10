import {
  Controller,
  Get,
  Put,
  Post,
  Redirect,
  UseGuards,
  Request
} from '@nestjs/common';
import { AppService } from './app.service';
import { Config } from './constants';
// import { JwtAuthGuard } from './api/auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  // @Redirect(Config.REDIRECT_URL)
  @Get()
  async get() {
    return "";
  }
  // @UseGuards(JwtAuthGuard)
  @Get('schema')
  async schema() {
    //return this.appService.get("Data");
  }
  // @UseGuards(JwtAuthGuard)
  @Put('schema')
  async schemaPut(@Request() req) {
    //return this.appService.update("Data",req.body);
  }
  // @UseGuards(JwtAuthGuard)
  @Post('schema')
  async schemaPost() {
    return this.appService.create();
  }
  // @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generate(@Request() req){
    //return this.appService.generate(req.param('name'));
  }
}
