// import { BaseDocument } from "../../database"
import DocumentRepository from "../../database/repository/DocumentRepository"
import MediaRepository from "../../database/repository/MediaRepository"
import ObjectRepository from "../../database/repository/ObjectRepository"
import { EventDispatcher } from "../../common/EventDispatcher"
import { Objective } from "../object"
import { InputCreateMedia, Media } from "../media"
import { User } from "../user"
import { BaseDocument, InputRole, AuthContentDocument, Role } from "../../database/models/Document";
import { User as DBUser } from "../../database/models/User";
import { Token, TypeFunction } from "../../common";
import { plainToClass } from 'class-transformer';
import { BaseMedia } from "../../database/models/Media"
import { ObjectBase } from "../../database/models/ObjectBase"
import { InputCreateObjective } from '../object'
// import { PubSub, PubSubEngine } from 'graphql-subscriptions';

class Auth {
    id: string;

    name: string;

    role: InputRole;

    query: boolean;

    create: boolean;

    edit: boolean;

    setting: boolean;

    delete: boolean;
    model(): AuthContentDocument {
        let auth = plainToClass(AuthContentDocument, this);
        return auth;
    }
}
export class UserAuth extends Auth {
    userId: string;
}
export class TokenAuth extends Auth {
    token: string;
}

export class InputCreateDocument {
    name: string
    model() {
        let model = new BaseDocument();
        return model
    }
}
export class InputUpdateDocument {
    name: string;
    // auths: UserAuth[];
    model() {
        let model = new BaseDocument();
        if (this.name)
            model.name = this.name;
        let auths = [];
        // this.auths?.map((item) => {
        //     let user = new DBUser();
        //     let auth = item.model();
        //     delete auth['id'];
        //     user.id = item.id;
        //     auth.user = user;
        //     auths.push(auth);
        // });
        model.auths = auths
        return model
    }
}

export class Document extends EventDispatcher {
    private _model: BaseDocument
    private _repository: DocumentRepository
    private _mediarepository: MediaRepository
    private _objectrepository: ObjectRepository
    // private static instance: Document;
    private _properties = {};
    private _id: string;
    private _parent: User
    // private _pubSub:PubSub;
    constructor(parent: User, model: BaseDocument) {
        super();
        this._model = model
        this._parent = parent
        this._repository = new DocumentRepository()
        this._mediarepository = new MediaRepository()
        this._objectrepository = new ObjectRepository()
        // const instance = Document.instance;
        // if (instance) {
        // return instance;
        // }
        // // this._pubSub = new PubSub();
        // Document.instance = this;
    }
    get user(): DBUser {
        return this._parent.model()
    }
    async update(input: InputUpdateDocument): Promise<boolean> {
        let result = await this.checkAuth(
            TypeFunction.SETTING,
            async (_auth)=>{
                let data = input.model();
                data.id = this._model.id;
                let result = await this._repository.update(_auth, data)
                if (result) {
                    this._model = result
                    return true
                }
                return
            }
        )
        return result
    }
    auth(): AuthContentDocument | null {
        let model = this._model
        if (model) {
            let user = this._parent.model()
            return model.auths.find(x => x.user?.id == user.id)
        }
    }

    token() {
        let token = new Token()
        let user_token = this._parent.token();
        let data = token.verify(user_token)
        data.documentid = this._model.id
        return token.get(data)
    }
    model() {
        return this._model
    }

    //object
    async object(id: string, fetch = true): Promise<Objective | null> {
        
        let result = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                if (!id)
                    return null;
                if (fetch) {
                    let obj = await this._objectrepository.get(_auth, id)
                    if (obj) {
                        return new Objective(this, obj)
                    }
                } else {
                    return new Objective(this, ObjectBase.create(id))
                }
            }
        )
        return result
    }
    async objects(): Promise<Objective[]> {
        
        let result = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                let objs = await this._objectrepository.get(_auth)
                let data = []
                objs.map(obj => {
                    data.push(new Objective(this, obj))
                })
                return data
            }
        )
        return result
    }
    async objectsByType(type: string, skip: number = 0, take: number = null,level:number): Promise<[Objective[], number]> {
        
        let result:[Objective[], number] = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                let [objs, total] = await this._objectrepository.getfilter(_auth, type, skip, take,level)
                let data:Objective[] = []
                objs.map(obj => {
                    data.push(new Objective(this, obj))
                })
                
                return [data, total]
            }
        )
        return result
    }
    async objectByType(type: string,id:string,level:number): Promise<Objective> {
        let result = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                let obj = await this._objectrepository.getByTypeOne(_auth, type,id,level)
                if(obj)
                    return new Objective(this, obj)
            }
        )
        return result
    }

    async createObject(input: InputCreateObjective): Promise<Objective> {
        let result = await this.checkAuth(
            TypeFunction.CREATE,
            async (_auth)=>{
                let obj = await this._objectrepository.create(_auth, input.parentId, input.model())
                return new Objective(this, obj)
            }
        )
        return result
    }

    //media
    async media(id: string, fetch = true): Promise<Media | null> {
        let result = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                if (fetch) {
                    let media = await this._mediarepository.get(_auth, id)
                    if (media)
                        return new Media(this, media)
                } else {
                    return new Media(this, BaseMedia.create(id))
                }
            }
        )
        return result
        
    }
    async medias(): Promise<Media[]> {
        let result = await this.checkAuth(
            TypeFunction.QUERY,
            async (_auth)=>{
                let medias = await this._mediarepository.get(_auth)
                let data = []
                medias.map(media => {
                    data.push(new Media(this, media))
                })
                return data
            }
        )
        return result
    }
    async createMedia(input: InputCreateMedia): Promise<Media> {
        let result = await this.checkAuth(
            TypeFunction.CREATE,
            async (_auth)=>{
                let media = await this._mediarepository.create(_auth, input.model())
                return new Media(this, media)
            }
        )
        return result
    }
    async createMedias(_inputs: InputCreateMedia[]): Promise<Media[]> {
        let result = await this.checkAuth(
            TypeFunction.CREATE,
            async (_auth)=>{
                let inputs = []
                _inputs.map(input => {
                    inputs.push(input.model())
                })
                let medias = await this._mediarepository.creates(_auth, inputs)
                let data = []
                medias.map(media => {
                    data.push(new Media(this, media))
                })
                return data
            }
        )
        return result
    }
    async createAuth(auth: TokenAuth): Promise<TokenAuth>
    async createAuth(auth: UserAuth): Promise<UserAuth>
    async createAuth(auth: TokenAuth | UserAuth) {
        let user_model = this._parent.model();
        let input = auth.model()
        let result = await this.checkAuth(
            TypeFunction.SETTING,
            async (_auth)=>{
                if(_auth.role == Role.SUPERADMIN){
                    if (auth instanceof TokenAuth) {
                        let tokenhelper = new Token()
                        input.token = tokenhelper.get({ data: 'test' })
                        input.user = _auth.user
                    } else {
                        if(user_model.id == auth.userId){
                            return null;
                        }
                        let user = new DBUser()
                        user.id = auth.userId
                        input.user = user
                    }

                    input.document = this._model
                    let result = await this._repository.createAuth(input)
                    if (result) {
                        if (auth instanceof TokenAuth) {
                            return plainToClass(TokenAuth, result)
                        } else {
                            return plainToClass(UserAuth, result)
                        }
                    }
                }
                return null
            }
        )
        return result;
    }
    async updateAuth(id:number, auth: UserAuth): Promise<UserAuth> {
        let user_model = this._parent?.model();
        if(user_model.id == auth.userId){
            return null;
        }
        let result = await this.checkAuth(
            TypeFunction.SETTING,
            async (_auth)=>{
                if(_auth.role == Role.SUPERADMIN){
                    let input = auth.model()
                    let user = new DBUser()
                    user.id = auth.userId
                    input.user = user
                    input.document = this._model
                    let result = await this._repository.updateAuth(id, input)
                    if (result) {
                        return plainToClass(UserAuth, result)
                    }
                }
                return null
            }
        )
        return result
    }
    async deleteAuth(id: number): Promise<boolean> {
        let result = await this.checkAuth(
            TypeFunction.SETTING,
            async (_auth)=>{
                if(_auth.role == Role.SUPERADMIN){
                    return await this._repository.deleteAuth(id)
                }
            }
        )
        return result
        
    }
    async checkAuth<T>(
        type: TypeFunction,
        success: (autho: AuthContentDocument) => Promise<T>,
        error: (e: any) => void = null,
    ) {
        let status = false
        let autho = this.auth()
        autho.document = this._model
        switch (type) {
            case TypeFunction.QUERY: {
                status = autho.query;
                break;
            }
            case TypeFunction.CREATE: {
                status = autho.create;
                break;
            }
            case TypeFunction.EDIT: {
                status = autho.edit;
                break;
            }
            case TypeFunction.DELETE: {
                status = autho.delete;
                break;
            }
            case TypeFunction.SETTING: {
                status = autho.setting;
                break;
            }
        }
        if (!status) {
            throw new Error('Not have access');
        }
        try {
            return await success(autho);
        } catch (err) {
            if(error)
            error(err)
        }
        
    }
    onChange(obj: any, pop: any, value: any) {
        let event = { type: 'onChange', obj, pop, value }
        this.dispatchEvent(event);
    }
    // async delete(softDelete = true): Promise<boolean> {
    //     let user = this._parent.model()
    //     return await this._repository.delete(user,this._model.id,softDelete)
    // }
    // async restore(): Promise<boolean> {
    //     let user = this._parent.model()
    //     return await this._repository.restore(user,this._model.id)
    // }
    import(data: any) {

    }
    export() {

    }
} 