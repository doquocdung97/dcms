import { Args, Resolver, Query, Mutation, Subscription } from '@nestjs/graphql';
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from 'src/api/auth/jwt-auth.guard';
import { plainToClass } from 'class-transformer';
import 'core/Extensions/StringExtensions'
import {
  CommandDocument,
  DocumentResult,
  InputCreateDocument,
  InputUpdateDocument,
  AcitveDocumentResult,
} from './schema';
import { DocumentService } from 'src/api/document/document.service';
import { BaseDocument } from 'core/database';
import { CustomUUID } from '../graphqlscalartype';
import { CurrentUser, CurrentUserGraphql } from 'src/api/auth/currentuser';
import { VariableMain } from 'src/constants';
import { App } from 'src/core/base';

import { PubSub, PubSubEngine, PubSubOptions } from 'graphql-subscriptions';


class CustomPubSub extends PubSub {
  private _app: App
  constructor(options?: PubSubOptions) {
    super(options)
    this._app = new App();
  }
  publish(triggerName: string, payload: any): Promise<void> {
    return super.publish(triggerName, payload);
  }
  subscribe(triggerName: string, onMessage: (...args: any[]) => void): Promise<number> {
    return super.subscribe(triggerName, onMessage)
  }
  unsubscribe(subId: number): void {
    let event = this['subscriptions'][subId]
    if (event) {
      let id = event[0]
      let doc = this._app.document(id)
      if(doc){
        let _event = this.onChange.bind(this)
        doc.removeEventListener('onChange',_event)
        this._app.removeDocument(id)
      }
    }
    super.unsubscribe(subId)
  }
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    let doc = this._app.createDocument(triggers.toString())
    let _event = this.onChange.bind(this)
    doc.addEventListener('onChange', _event)
    return super.asyncIterator(triggers)
  }
  onChange(agrs){
    let cmd = new CommandDocument();
    cmd.key = agrs.pop;
    cmd.cmd = "test";
    cmd.value = agrs.value;
    this.publish(agrs.target._id, { listeningDocument: cmd });
  }
}

export const _pubSub = new CustomPubSub();

@UseGuards(JwtAuthGuardGraphql)
@Resolver((of) => BaseDocument)
export class DocumentResolver {
  constructor(private documentService: DocumentService) { }

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

  @Subscription((returns) => CommandDocument, {
    defaultValue: null,
    nullable: true,
    filter: (payload, variables, ctx) => {
      // console.log(payload, variables,ctx.req?.user)
      return true
      return payload.listeningDocument.key == variables.id
    },
  })
  listeningDocument(@Args('id', { type: () => CustomUUID }) id: string, @Request() req, @CurrentUserGraphql() user) {
    return _pubSub.asyncIterator(id)
  }
}