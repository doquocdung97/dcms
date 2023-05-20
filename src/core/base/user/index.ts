import { Document } from "../document";
import { User as UserModel } from "src/core/database"
export class User {
    private _model: UserModel
    constructor(model: UserModel) {
        this._model = model
    }
} 