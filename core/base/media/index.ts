import { BaseMedia } from "../../database/models/Media"
import { Document } from "../document"
import { File, FileHelper, LoggerHelper, generateRandomText } from '../../common';
import { plainToClass } from "class-transformer";
import MediaRepository from "../../database/repository/MediaRepository"
import { TypeFunction } from "../../common"
import { AuthContentDocument } from "../../database/models/Document";
import { Variable } from "../../constants";
export class InputCreateMedia {
    name: string;

    file: File;

    public: boolean;

    model() {
        let model = plainToClass(BaseMedia, this);
        return model;
    }
}

export class InputUpdateMedia {
    name: string;

    file: File;

    public: boolean;

    model() {
        let model = plainToClass(BaseMedia, this);
        return model;
    }
}

export class Media {
    private _model: BaseMedia;
    private _parent: Document;
    private _repository: MediaRepository;
    private _fileHelper: FileHelper;
    private _logger: LoggerHelper;
    constructor(parent: Document, model: BaseMedia) {
        this._parent = parent;
        this._model = model;
        this._repository = new MediaRepository();
        this._fileHelper = new FileHelper();
        this._logger = new LoggerHelper(this.constructor.name);
    }
    model() {
        return this._model;
    }
    async create(_auth: AuthContentDocument): Promise<Media> {
        const model = this.model()
        if (model.file) {
            model.type = this._fileHelper.getType(model.file.filename)
            model.url = await this._fileHelper.upload(
                generateRandomText(6),
                model.file,
            );
            model.url = this._fileHelper.parseUrl(model.url)
            const result = await this._repository.create(_auth, model)
            this._model = result
            return this
        }
        return null
    }
    async update(input: InputUpdateMedia): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth) => {
                let input_model = input.model()
                const media = await this._repository.get(_auth, input_model.id, false)
                if (media) {
                    input_model = Object.assign(media, input_model)
                    const path = this._fileHelper.getPath(media.url)
                    const pathfileold = media.url
                    const pathfile = await this._fileHelper.upload(path.replace(Variable.FORDER_FILE, String()), input_model.file)
                    input_model.url = this._fileHelper.parseUrl(pathfile);
                    input_model.type = this._fileHelper.getType(pathfile)
                    let result = await this._repository.update(_auth, input_model)
                    if (result) {
                        if (media.url != input_model.url) {
                            await this._fileHelper.delete(pathfileold)
                        }
                        this._model = result
                        return true
                    }
                    return
                }
            },
            (error) => {
                this._logger.error(`Update ${error}`)
            }
        )
        return result
    }
    async delete(softDelete = true): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.DELETE,
            async (_auth) => {
                const callback = async (media: BaseMedia): Promise<boolean> => {
                    if (softDelete) {
                        const path = this._fileHelper.getPath(media.url)
                        const trash = this._fileHelper.joinpath(Variable.FORDER_FILE, Variable.TRASH, path.replace(Variable.FORDER_FILE, String()))
                        let status = await this._fileHelper.copyFolder(path, trash)
                        if (status) {
                            status = await this._fileHelper.deleteDir(path);
                            return status;
                        }
                    }else{
                        let pathdelete = this._fileHelper.getPath(media.url)
                        if(media.deleteAt){
                            pathdelete = this._fileHelper.joinpath(Variable.FORDER_FILE, Variable.TRASH, pathdelete.replace(Variable.FORDER_FILE, String()))
                        }
                        return await this._fileHelper.deleteDir(pathdelete);
                    }
                    return false
                }
                return await this._repository.delete(_auth, this._model.id, callback, softDelete)
            }
        )
        return result
    }
    async restore(): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth) => {
                const callback = async (media: BaseMedia): Promise<boolean> => {
                    const path = this._fileHelper.getPath(media.url)
                    const trash = this._fileHelper.joinpath(Variable.FORDER_FILE, Variable.TRASH, path.replace(Variable.FORDER_FILE, String()))
                    let status = await this._fileHelper.copyFolder(trash, path)
                    if (status) {
                        status = await this._fileHelper.deleteDir(trash);
                        return status;
                    }
                }
                return await this._repository.restore(_auth, this._model.id, callback)
            }
        )
        return result
    }
} 