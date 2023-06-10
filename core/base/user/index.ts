import { Document,InputCreateDocument } from "../document";
import { User as UserModel } from "../../database/models/User"
import * as jwt from 'jsonwebtoken'
import UserRepository from "../../database/repository/UserRepository";
import { Config } from "../../config";
import DocumentRepository from "../../database/repository/DocumentRepository";
import { BaseDocument } from "../../database/models/Document";
import { Token } from "../../common";

export class User {
    private _model: UserModel
    private _repository: UserRepository
    private _doc_repository: DocumentRepository
    private _config: Config
    private _activedocument: Document
    constructor(model: UserModel) {
        this._model = model;
        this._doc_repository = new DocumentRepository();
        this._config = new Config();
    }
    model() {
        return this._model
    }
    token() {
        if (this._model) {
            let token = new Token()
            return token.get({
                email: this._model.email
            })
        }
    }
    // static async tokenVerify(val) {
    //     let repository = new UserRepository();
    //     let token = new Token();
    //     let verify = token.verify(val);// jwt.verify(token, config.get<string>("SECRET_KEY"));
    //     if (verify) {
    //         let user_model = await repository.findOneByEmail(verify.email);
    //         user_model.currentDoc = user_model.connect.find((x) => x.document?.id == verify.documentid);
    //         let user = new User(user_model);
    //         if(user_model.currentDoc){
    //             user._activedocument = new Document(user,user_model.currentDoc.document)
    //         }
    //         return user
    //     }
    //     return null;
    // }
    async documents(): Promise<Document[]> {
        let docs = await this._doc_repository.get(this._model)
        let list = []
        docs.map(doc => {
            list.push(new Document(this, doc))
        })
        return list
    }
    setActiveDocument(doc:Document) {
        this._activedocument = doc
    }
    activeDocument() {
        return this._activedocument
    }
    async document(id: string,fetch = true): Promise<Document | null> {
        if(fetch){
            let doc = await this._doc_repository.get(this._model, id)
            if (doc) {
                return new Document(this, doc)
            }
            return null
        }else{
            let doc = BaseDocument.create(id)
            return new Document(this, doc)
        }
    }
    /**
     * 
     * @param model 
     * @returns 
     */
    async create(input: InputCreateDocument): Promise<Document> {
        let doc = await this._doc_repository.create(this._model, input.model())
        if (doc) {
            return new Document(this, doc)
        }
    }
    async delete(softDelete = true): Promise<boolean> {
        return null
    }
    async restore(): Promise<boolean> {
        return null
    }

} 