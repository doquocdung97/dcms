import { Injectable } from '@nestjs/common';
import { BaseDocument, DataBase, User } from './core/database';

@Injectable()
export class AppService {
  constructor() {
  }
  async getHello() {
    let data = new DataBase()
    let datasource = data.getDataSource('main')
    if (datasource) {
      let rep = datasource.getRepository(User)
      let rep1 = await datasource.getRepository(BaseDocument)
      return {
        user: await rep.find(),
        document: await rep1.find()
      };
    }
    return {};
  }
}
