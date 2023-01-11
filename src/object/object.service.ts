import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ObjectBase from 'src/database/models/ObjectBase';

@Injectable()
export class ObjectService {
  constructor(
    @InjectRepository(ObjectBase)
    private objectRepository: Repository<ObjectBase>,
  ) {}
}
