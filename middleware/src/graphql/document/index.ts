import { Args, Resolver, Query, Mutation, Subscription, Int } from '@nestjs/graphql';
import { Request, UseGuards } from '@nestjs/common';
// import 'cms/Extensions/StringExtensions'
import {
  CommandDocument,
  DocumentResult,
  InputCreateDocument,
  InputUpdateDocument,
  AcitveDocumentResult,
  BaseDocument,
  TokenAuthResult,
  UserAuthResult,
  UserAuth, TokenAuth,
  UserAuthContentDocument,
  TokenAuthContentDocument
} from './schema';

import { CustomUUID } from '../graphqlscalartype';
import { BaseResultCode, CMS, User } from 'cms';

import { PubSub, PubSubEngine, PubSubOptions } from 'graphql-subscriptions';
import { CurrentUserGraphql, JwtAuthGuardGraphql } from '../user/guard';
import { plainToClass } from 'class-transformer';
import { BaseResult } from '../objecttype';


class CustomPubSub extends PubSub {
  private _app
  constructor(options?: PubSubOptions) {
    super(options)
    // this._app = new CMS.App();
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
      if (doc) {
        let _event = this.onChange.bind(this)
        doc.removeEventListener('onChange', _event)
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
  onChange(agrs) {
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
  private _app
  constructor() {
    this._app = new CMS.App()
  }

  @Query(() => BaseDocument, { nullable: true })
  async document(@Args('id') id: string, @CurrentUserGraphql() user: User.User) {
    let doc = await user.document(id)
    return doc?.model();
  }

  @Query(() => [BaseDocument], { nullable: true })
  async documents(@CurrentUserGraphql() user: User.User) {
    let docs = await user.documents();
    let list = []
    docs.map(doc => {
      list.push(Object.assign(new BaseDocument(), doc.model()))
    })

    return list
  }

  @Mutation(() => AcitveDocumentResult)
  async activeDocument(@CurrentUserGraphql() user: User.User, @Args('id') id: string) {
    let result = new AcitveDocumentResult()
    let doc = await user.document(id);
    if (doc) {
      result.data = plainToClass(BaseDocument, doc.model())
      result.token = doc.token()
    }
    return result
  }

  @Mutation(() => DocumentResult)
  async createDocument(@Args('input') input: InputCreateDocument, @CurrentUserGraphql() user: User.User) {
    let result = new DocumentResult()
    try {
      let data = plainToClass(InputCreateDocument, input);
      let model = await data.createModel();
      let doc = await user.create(model);
      result.data = plainToClass(BaseDocument, doc?.model());
    } catch (error) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  @Mutation(() => DocumentResult)
  async updateDocument(@CurrentUserGraphql() user: User.User, @Args('input') input: InputUpdateDocument) {
    let result = new DocumentResult()
    try {
      let doc = await user.document(input.id, false);
      input = plainToClass(InputUpdateDocument, input);
      let status = await doc.update(input.createModel())
      if (status) {
        result.data = plainToClass(BaseDocument, doc?.model());
      }

    } catch (error) {
      console.log(error)
    }
    return result
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

  @Mutation(() => TokenAuthResult)
  async createTokenAuthDocument(
    @Args('input') input: TokenAuth,
    @CurrentUserGraphql() user: User.User) {

    let result = new TokenAuthResult()
    try {
      input = plainToClass(TokenAuth, input);
      let doc = await user.activeDocument();
      let data = await doc.createAuth(input.createModel())
      if (data) {
        result.data = plainToClass(TokenAuthContentDocument, data)
      } else {
        result.code = BaseResultCode.B002;
        result.success = false;
      }

    } catch (error) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  @Mutation(() => UserAuthResult)
  async createUserAuthDocument(
    @Args('input') input: UserAuth,
    @CurrentUserGraphql() user: User.User) {

    let result = new UserAuthResult()
    try {
      input = plainToClass(UserAuth, input);
      let doc = await user.activeDocument();
      let data = await doc.createAuth(input.createModel())
      if (data) {
        result.data = plainToClass(UserAuthContentDocument, data)
      } else {
        result.code = BaseResultCode.B002;
        result.success = false;
      }
    } catch (error) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  @Mutation(() => UserAuthResult)
  async updateUserAuthDocument(
    @Args('id',{type: () => Int}) id: number,
    @Args('input') input: UserAuth,
    @CurrentUserGraphql() user: User.User) {

    let result = new UserAuthResult()
    try {
      input = plainToClass(UserAuth, input);
      let doc = await user.activeDocument();
      let data = await doc.updateAuth(id,input.createModel())
      if (data) {
        result.data = plainToClass(UserAuthContentDocument, data)
      } else {
        result.code = BaseResultCode.B002;
        result.success = false;
      }
    } catch (error) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
  @Mutation(() => BaseResult)
  async deleteAuthDocument(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUserGraphql() user: User.User) {

    let result = new BaseResult()
    try {
      let doc = await user.activeDocument();
      let data = await doc.deleteAuth(id)
      if(!data){
        result.code = BaseResultCode.B002;
        result.success = false;
      }
    } catch (error) {
      result.code = BaseResultCode.B001;
      result.success = false;
    }
    return result;
  }
}