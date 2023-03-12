import { BaseDocument } from "src/core/database"
import DocumentRepository from "src/core/database/repository/DocumentRepository"
import { EventDispatcher } from "src/core/EventDispatcher"
import { Objective } from "../object"
import { Media } from "../media"
import { User } from "../user"


export class Document extends EventDispatcher {
    private _model: BaseDocument
    private _repository: DocumentRepository
    constructor(model: BaseDocument, parent: User) {
        super()
        this._model = model
    }
    getID() {
        return this._model.id
    }
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
    onChange(obj: Objective, pop: string, value: any) {
        let event = { type: 'onChange', pop, value }
        this.dispatchEvent(event);
    }
    import(data: any) {

    }
    export() {

    }
} 