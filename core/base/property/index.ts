import { PropertyBase } from "../../database/models/Property"
import PropertyRepository from '../../database/repository/PropertyRepository'
import { Objective } from "../object"
import { TypeProperty } from '../../database/common'
import { plainToClass } from "class-transformer"
import { TypeFunction } from "../../common"

export class InputCreateProperty {
    name: string;

    type: TypeProperty;

    description: string;

    status: number;

    value: any;

    model(): PropertyBase {
        let model = plainToClass(PropertyBase, this)
        return model
    }
}
export class InputUpdateProperty {
    id: number;

    name: string;

    type: TypeProperty;

    description: string;

    status: number;

    value: any;

    model(): PropertyBase {
        let model = plainToClass(PropertyBase, this)
        return model
    }
}

export class Property {
    private _model: PropertyBase
    private _parent: Objective
    private _repository: PropertyRepository
    constructor(parent: Objective, model: PropertyBase) {
        this._parent = parent;
        this._model = model;
        this._repository = new PropertyRepository();
    }
    model() {
        return this._model;
    }
    async delete(softDelete = true): Promise<boolean> {
        let result = await this._parent.document.checkAuth(
            TypeFunction.DELETE,
            async (_auth)=>{
                return await this._repository.delete(_auth, this._model.id,softDelete);;
            }
        )
        return result
    }
    async restore(): Promise<boolean> {
        let result = await this._parent.document.checkAuth(
            TypeFunction.EDIT,
            async (_auth)=>{
                return await this._repository.restore(_auth, this._model.id);;
            }
        )
        return result
    }
    async update(input: InputUpdateProperty): Promise<boolean> {
        let result = await this._parent.document.checkAuth(
            TypeFunction.EDIT,
            async (_auth)=>{
                let result = await this._repository.update(_auth, input.model());
                if (result) {
                    this._model = result;
                    this._parent.onChange(this,result.value)
                    return true;
                }
                return false;
            }
        )
        return result
    }
}
export {
    TypeProperty
}