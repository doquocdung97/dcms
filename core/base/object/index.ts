import { plainToClass } from "class-transformer"
import { ObjectBase } from "../../database/models/ObjectBase"
import { User as DBUser } from "../../database/models/User";
import ObjectRepository from "../../database/repository/ObjectRepository"
import PropertyRepository from "../../database/repository/PropertyRepository"
import { Document } from "../document"
import { Property, InputCreateProperty } from "../property"
import { PropertyBase } from "../../database/models/Property";

export class InputCreateObjective {
    parentId: string;
    name: string;
    type: string;
    model(): ObjectBase {
        let model = plainToClass(ObjectBase, this)
        return model
    }
}
export class InputUpdateObjective {
    id: string;
    name: string;
    type: string;
    children: [string];
    model(): ObjectBase {
        let model = plainToClass(ObjectBase, this)
        // let objs = [];

        // this.children?.map((obj) => {
        // let o = new ObjectBase();
        // o.id = obj;
        // objs.push(o);
        // });
        // model.children = objs;
        return model
    }
}

export class Objective {
    private _model: ObjectBase
    private _parent: Document
    private _repository: ObjectRepository
    private _propertyrepository: PropertyRepository

    constructor(parent: Document, model: ObjectBase) {
        this._model = model
        this._parent = parent
        this._repository = new ObjectRepository()
        this._propertyrepository = new PropertyRepository()
    }
    model() {
        return this._model
    }
    get user(): DBUser {
        return this._parent.user
    }
    async update(input: InputUpdateObjective): Promise<boolean> {
        let input_model = input.model()
        let result = await this._repository.update(this._parent.user, input_model)
        if (result) {
            this._model = result
            return true
        }
        return
    }

    async delete(softDelete = true): Promise<boolean> {
        let user = this._parent.user
        return await this._repository.delete(user, this._model.id, softDelete)
    }
    async restore(): Promise<boolean> {
        let user = this._parent.user
        return await this._repository.restore(user, this._model.id)
    }

    async property(id: number, fetch = true): Promise<Property | null> {
        if (fetch) {
            let user = this._parent.user;
            let pro = await this._propertyrepository.get(user, this._model.id, id);
            if (pro) {
                return new Property(this, pro);
            }
        } else {
            let pro = new PropertyBase();
            pro.id = id;
            return new Property(this, pro);
        }
        return null;
    }
    async properties(): Promise<Property[]> {
        let user = this._parent.user
        let pros = await this._propertyrepository.get(user, this._model.id)
        let data = []
        pros.map(pro => {
            data.push(new Property(this, pro))
        })
        return data
    }
    async createProperty(input: InputCreateProperty): Promise<Property | null> {
        let user = this._parent.user
        let pro = await this._propertyrepository.create(user, this._model.id, input.model())
        if (pro) {
            return new Property(this, pro)
        }
        return null
    }
    onChange(pro,value){
        this._parent.onChange(this,pro,value)
    }
} 