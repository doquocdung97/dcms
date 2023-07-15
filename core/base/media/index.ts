import { BaseMedia } from "../../database/models/Media"
import { Document } from "../document"
import { File } from '../../common';
import { plainToClass } from "class-transformer";
import MediaRepository  from "../../database/repository/MediaRepository"
import { TypeFunction } from "../../common"
export class InputCreateMedia {
    name: string;

    file: File;

    public:boolean;

    model(){
        let model = plainToClass(BaseMedia, this);
        return model;
    }
}

export class InputUpdateMedia {
    name: string;

    file: File;

    public:boolean;

    model(){
        let model = plainToClass(BaseMedia, this);
        return model;
    }
}

export class Media{
    private _model:BaseMedia
    private _parent: Document
    private _repository: MediaRepository

    constructor(parent:Document,model:BaseMedia){
        this._parent = parent
        this._model = model
        this._repository = new  MediaRepository()
    }
    model(){
        return this._model;
    }
    async update(input:InputUpdateMedia):Promise<boolean>{
        
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth)=>{
                let input_model = input.model()
                let result = await this._repository.update(_auth, input_model)
                if (result) {
                    this._model = result
                    return true
                }
                return
            }
        )
        return result
    }
    async delete(softDelete = true): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.DELETE,
            async (_auth)=>{
                return await this._repository.delete(_auth,this._model.id,softDelete)
            }
        )
        return result
    }
    async restore(): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth)=>{
                return await this._repository.restore(_auth,this._model.id)
            }
        )
        return result
        
    }
} 