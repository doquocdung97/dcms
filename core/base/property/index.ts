import { PropertyBase } from "../../database/models/Property"
import PropertyRepository from '../../database/repository/PropertyRepository'
import { Objective } from "../object"
import { TypeProperty } from '../../database/common'
import { plainToClass } from "class-transformer"

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
        let user = this._parent.user;
        return await this._repository.delete(user, this._model.id, softDelete);
    }
    async restore(): Promise<boolean> {
        let user = this._parent.user;
        return await this._repository.restore(user, this._model.id);
    }
    async update(input: InputUpdateProperty): Promise<boolean> {
        let user = this._parent.user;
        let result = await this._repository.update(user, input.model());
        if (result) {
            this._model = result;
            this._parent.onChange(this,result.value)
            return true;
        }
        return false;
    }
}
export {
    TypeProperty
}