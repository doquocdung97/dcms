import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  BaseDocument,
  User,
  AuthContentDocument,
  Role,
} from 'src/core/database';
import { DocumentResult } from 'src/graphql/document/schema';
import DocumentRepository from 'src/core/database/repository/DocumentRepository';
import { DataSource } from 'typeorm';

@Injectable()
export class DocumentService {
  private documentRepository: DocumentRepository;
  constructor(
    @Inject(REQUEST)
    private request,
    private dataSource: DataSource,
  ) {
    this.documentRepository = new DocumentRepository(dataSource, request);
  }
  async get(id: string = null) {
    let result = await this.documentRepository.get(id);

    return result;
  }
  async create(input: BaseDocument): Promise<DocumentResult> {
    let user = User.getByRequest(this.request);
    let result = new DocumentResult();
    let auth = new AuthContentDocument(Role.SUPERADMIN, user);
    input.auths = [auth];
    result.data = await this.documentRepository.create(input);
    return result;
  }
  async update(input: BaseDocument): Promise<DocumentResult> {
    let result = new DocumentResult();
    //console.log(input);
    result.data = await this.documentRepository.update(input);
    //console.log(result);
    return result;
  }
}
