import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  BaseDocument,
  User,
  BaseResultCode,
} from 'src/core/database';
import {
  DocumentResult,
  AcitveDocumentResult,
} from 'src/graphql/document/schema';
import DocumentRepository from 'src/core/database/repository/DocumentRepository';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class DocumentService {
  private documentRepository: DocumentRepository;
  constructor(
    @Inject(REQUEST)
    private request,
    private authService: AuthService,
  ) {
    this.documentRepository = new DocumentRepository(request);
  }
  async get(id: string = null) {
    return await this.documentRepository.get(id);
  }
  async create(input: BaseDocument): Promise<DocumentResult> {
    var result = await this.documentRepository.create(input);
    return result
  }
  async update(input: BaseDocument): Promise<DocumentResult> {
    var result = await this.documentRepository.update(input);
    return result
  }
  async acitveDocument(id: string): Promise<AcitveDocumentResult> {
    let result = new AcitveDocumentResult();
    let user = User.getByRequest(this.request);
    let auth = user?.connect.find((x) => x.document.id == id);
    if (user && auth) {
      user.currentDoc = auth;
      result.data = auth.document;
      result.token = this.authService.getToken(user);
    } else {
      result.success = false;
      result.code = BaseResultCode.B002;
    }
    return result;
  }
}
