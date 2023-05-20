import { BaseDocument } from "src/core/database"
import DocumentRepository from "src/core/database/repository/DocumentRepository"
import { EventDispatcher } from "src/core/EventDispatcher"
import { Objective } from "../object"
import { Media } from "../media"
// import { User } from "../user"
// import { PubSub, PubSubEngine } from 'graphql-subscriptions';


export class Document extends EventDispatcher {
    // private _model: BaseDocument
    // private _repository: DocumentRepository
    // private static instance: Document;
    private _properties = {};
    private _id: string;
    // private _pubSub:PubSub;
    constructor(id: string) {
        super();
        this._id = id
        // const instance = Document.instance;
        // if (instance) {
        // return instance;
        // }
        // // this._pubSub = new PubSub();
        // Document.instance = this;
    }
    // getID() {
    //     return this._model.id
    // }
    object(id: string): Objective {
        return
    }
    objects(): Objective[] {
        return
    }
    TreeObjects() {

    }
    media(id: string): Media {
        return
    }
    medias(): Media[] {
        return
    }
    onChange(obj: any, pop: string, value: any) {
        let event = { type: 'onChange', obj, pop, value }
        this.dispatchEvent(event);
    }
    import(data: any) {

    }
    export() {

    }
} 