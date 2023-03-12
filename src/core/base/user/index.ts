import { Document } from "../document";
import { User as UserModel } from "src/core/database"
export class User {
    private _model: UserModel
    constructor(model: UserModel) {
        this._model = model
    }
    document(id: string): Document {
        let docs = this.documents()
        return docs.find(x => x.getID() == id)
    }
    documents(): Document[] {
        let docs = []
        let self = this
        this._model.connect.map(auth => {
            docs.push(new Document(auth.document, self))
        })
        return docs
    }
} 