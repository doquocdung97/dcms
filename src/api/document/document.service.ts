import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  BaseDocument,
  User,
  AuthContentDocument,
  Role,
} from 'src/core/database';
import {
  DocumentResult,
  AcitveDocumentResult,
} from 'src/graphql/document/schema';
import DocumentRepository from 'src/core/database/repository/DocumentRepository';
import { DataSource } from 'typeorm';
import { Authorization, TypeFunction } from 'src/core/common';
import { BaseResultCode } from 'src/graphql';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class DocumentService {
  private documentRepository: DocumentRepository;
  constructor(
    @Inject(REQUEST)
    private request,
    private dataSource: DataSource,
    private authService: AuthService,
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
    let user = User.getByRequest(this.request);
    await Authorization(
      user,
      TypeFunction.EDIT,
      async (autho) => {
        if (autho.role == Role.SUPERADMIN && input.id == autho.document.id) {
          result.data = await this.documentRepository.update(input);
          if (!result.data) {
            result.success = false;
            result.code = BaseResultCode.B002;
          }
        } else {
          result.success = false;
          result.code = BaseResultCode.B002;
        }
      },
      async (ex) => {
        result.success = false;
        result.code = BaseResultCode.B001;
      },
    );
    if (!result.data) {
      throw new UnauthorizedException();
    }
    return result;
  }
  async acitveDocument(id: string): Promise<AcitveDocumentResult> {
    let result = new AcitveDocumentResult();
    let user = User.getByRequest(this.request);
    //let repository = this.documentRepository.getRepository();
    //let doc = await repository.findOne({
    //  relations: {
    //    auths: {
    //      user: true,
    //    },
    //  },
    //  where: { id: id, auths: { user: { id: user.id } } },
    //});
    let auth = user?.connect.find((x) => x.document.id == id);
    if (user && auth) {
      user.currentDoc = auth;
      result.data = auth.document;
      result.token = this.authService.getToken(user);
    } else {
      result.success = false;
      result.code = BaseResultCode.B002;
    }
    console.log(user);
    return result;
  }
}
