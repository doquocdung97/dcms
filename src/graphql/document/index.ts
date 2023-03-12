import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import { plainToClass } from 'class-transformer';
import {
  DocumentResult,
  InputCreateDocument,
  InputUpdateDocument,
  AcitveDocumentResult,
} from './schema';
import { DocumentService } from 'src/api/document/document.service';
import { BaseDocument } from 'core/database';
@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => BaseDocument)
export class DocumentResolver {
  constructor(private documentService: DocumentService) {}

  @Query(() => BaseDocument, { nullable: true })
  async document(@Args('id') id: string) {
    var result = await this.documentService.get(id);
    return result;
  }

  @Query(() => [BaseDocument], { nullable: true })
  async documents() {
    var result = await this.documentService.get();
    return result;
  }

  @Mutation(() => AcitveDocumentResult)
  async activeDocument(@Args('id') id: string) {
    return await this.documentService.acitveDocument(id);
  }

  @Mutation(() => DocumentResult)
  async createDocument(@Args('input') input: InputCreateDocument) {
    let data = plainToClass(InputCreateDocument, input);
    let model = await data.createModel();
    return await this.documentService.create(model);
  }
  @Mutation(() => DocumentResult)
  async updateDocument(@Args('input') input: InputUpdateDocument) {
    let data = plainToClass(InputUpdateDocument, input);
    let model = await data.createModel();
    return await this.documentService.update(model);
  }
}
