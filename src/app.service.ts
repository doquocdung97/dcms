import { Injectable } from '@nestjs/common';
import { DataBase } from './core/database';

@Injectable()
export class AppService {
  constructor() {
  }
  async get() {
    new DataBase()
  }
}
