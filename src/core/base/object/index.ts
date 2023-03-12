import { ObjectBase } from "src/core/database"
import { Document } from "../document"
import { Property } from "../property"

export class Objective{
    private _model:ObjectBase
    constructor(id:string,parent:Document){
    }
    property(id:string):Property{
        return 
    }
    properties():Property[]{
        return
    }
    onChange(pop:string,value:any){

    }
} 