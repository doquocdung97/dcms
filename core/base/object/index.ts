import { plainToClass } from "class-transformer"
import { ObjectBase } from "../../database/models/ObjectBase"
import { User as DBUser } from "../../database/models/User";
import ObjectRepository from "../../database/repository/ObjectRepository"
import PropertyRepository from "../../database/repository/PropertyRepository"
import { Document } from "../document"
import { Property, InputCreateProperty } from "../property"
import { PropertyBase } from "../../database/models/Property";
import { TypeFunction } from "../../common"

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
    get document(): Document | null {
        return this._parent
    }
    constructor(parent: Document, model: ObjectBase) {
        this._model = model
        this._parent = parent
        // this.mainRepository = new ObjectRepository()
        // this.propertyRepository = new PropertyRepository()

    }
    get mainRepository() {
        if (!this._repository)
            this._repository = new ObjectRepository()
        return this._repository
    }
    get propertyRepository() {
        if (!this._propertyrepository)
            this._propertyrepository = new PropertyRepository(this.Lang)
        return this._propertyrepository
    }
    get Lang() {
        return this._parent.Lang;
    }
    get user(): DBUser {
        return this._parent.user
    }
    // init() {
    //     if (!this.mainRepository)
    //         this.mainRepository = new ObjectRepository()
    //     if (!this.propertyRepository)
    //         this.propertyRepository = new PropertyRepository()
    // }
    model() {
        return this._model
    }
    
    async update(input: InputUpdateObjective): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth) => {
                let input_model = input.model()
                let result = await this.mainRepository.update(_auth, input_model)
                if (result) {
                    this._model = result
                    return true
                }
            }
        )
        return result
    }

    async delete(softDelete = true): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.DELETE,
            async (_auth) => {
                return await this.mainRepository.delete(_auth, this._model.id, softDelete)
            }
        )
        return result
    }
    async restore(): Promise<boolean> {
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth) => {
                return await this.mainRepository.restore(_auth, this._model.id)
            }
        )
        return result
    }

    async property(id: number, fetch = true): Promise<Property | null> {
        let result = await this._parent.checkAuth(
            TypeFunction.QUERY,
            async (_auth) => {
                if (fetch) {
                    let pro = await this.propertyRepository.get(_auth, this._model?.id, id);
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
        )
        return result
    }
    async properties(): Promise<Property[]> {
        let result = await this._parent.checkAuth(
            TypeFunction.QUERY,
            async (_auth) => {
                let pros = await this.propertyRepository.get(_auth, this._model.id)
                let data = []
                pros.map(pro => {
                    data.push(new Property(this, pro))
                })
                return data
            }
        )
        return result
    }
    async createProperty(input: InputCreateProperty): Promise<Property | null> {
        let result = await this._parent.checkAuth(
            TypeFunction.CREATE,
            async (_auth) => {
                let pro = await this.propertyRepository.create(_auth, this._model.id, input.model())
                if (pro) {
                    return new Property(this, pro)
                }
                return null
            }
        )
        return result
    }
    async createPropertys(inputs: InputCreateProperty[]): Promise<Property[] | null> {
        let result = await this._parent.checkAuth(
            TypeFunction.CREATE,
            async (_auth) => {
                let models = []
                inputs.map(input => {
                    models.push(input.model())
                })
                let pros = await this.propertyRepository.creates(_auth, this._model.id, models)
                if (pros && pros.length > 0) {
                    let propertys: Property[] = []
                    pros.map(pro => {
                        propertys.push(new Property(this, pro))
                    })
                    if (!this._model.properties) {
                        this._model.properties = []
                    }
                    this._model.properties.push(...pros)
                    return propertys
                }
                return null
            }
        )
        return result
    }

    private async updatePropertys(inputs: PropertyBase[]): Promise<PropertyBase[] | null> {
        // let user = this._parent.user
        // // let models = []
        // // inputs.map(input => {
        // //     models.push(input.model())
        // // })

        // let pros = await this.propertyRepository.updates(user, this._model.id, inputs)
        // // if (pros && pros.length > 0) {
        // //     let propertys: Property[] = []
        // //     pros.map(pro => {
        // //         propertys.push(new Property(this, pro))
        // //     })
        // //     return propertys
        // // }
        // return pros
        let result = await this._parent.checkAuth(
            TypeFunction.EDIT,
            async (_auth) => {
                return await this.propertyRepository.updates(_auth, this._model.id, inputs)
            }
        )
        return result
    }
    toJSON() {
        return this._model.toJSON()
    }
    async updateProperty(pro: Object): Promise<Object> {
        let fields = Object.keys(pro)
        let propertys = []
        fields.map(field => {
            let property = this._model.properties.find(x => x.name == field)
            let p = pro[field]
            if (property) {
                property.value = p.value
                propertys.push(property)
            } else {
                let pro_new = new PropertyBase();
                let schema = p.schema
                pro_new.name = field
                pro_new.type = schema.type
                pro_new.value = p.value
                propertys.push(pro_new)
            }
        })
        propertys = await this.updatePropertys(propertys)
        if (propertys) {
            propertys.map(p => {
                let pro = this._model.properties.find(x => x.name == p.name)
                if (!pro) {
                    this._model.properties.push(p)
                }
            })
            // this._model.properties
            return this.toJSON()
        }
        return {}
    }
    // getValue(name): any {
    //     if (this._model) {
    //         if (name == 'id' || name == 'updatedAt' || name == 'createdAt') {
    //             return this._model[name]
    //         }
    //         return this._model.properties.find(x => x.name == name)?.value
    //     }
    // }
    onChange(pro, value) {
        this._parent.onChange(this, pro, value)
    }
} 