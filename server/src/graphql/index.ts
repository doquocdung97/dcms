import { FieldClient, GenerateTemplate, ObjectClient } from '../mod'
import {
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLEnumType,
	GraphQLList,
	GraphQLString,
	GraphQLInt,
	GraphQLNonNull,
	GraphQLInputObjectType,
	GraphQLFieldConfig,
	getNamedType,
	GraphQLResolveInfo
} from 'graphql';
import { readdirSync } from 'fs'
import { join } from 'path'
import { GraphQLUUID, GraphQLDatetime } from './scalartype';
import { createResultModel, ResultBase, createEnum, createResultPagination, Media, createFilters ,BaseObjectType} from './objecttype';
import { CMS, Objective, Property } from 'cms';
import { Variables } from '../constants';
import { Document } from 'cms/dist/base';
class CommonObjectType {
	private static instance: CommonObjectType;
	private _type = {}
	constructor() {
		const instance = CommonObjectType.instance;
		if (instance) {
			return instance;
		}

		this._type = {
			'string': GraphQLString,
			'number': GraphQLInt,
			'media': Media,
			'medias': new GraphQLList(Media),
			'inputmedia': GraphQLUUID,
			'inputmedias': new GraphQLList(GraphQLUUID),
			'UUID': GraphQLUUID,
			'datetime': GraphQLDatetime,
		}

		CommonObjectType.instance = this;
	}
	get(name, input: boolean = false) {
		let type = this._type[name]
		if (input) {
			let inputtype = this._type[`input${name}`]
			if (inputtype) {
				type = inputtype
			}
		}
		return type
	}
	add(name: string, type: GraphQLObjectType): boolean {
		let typeinlist = this._type[name];
		if (!typeinlist) {
			this._type[name] = type;
			return true;
		}
		return false;
	}
}
class GenerateModelDict {
	public _model: GraphQLObjectType
	public _input: GraphQLInputObjectType
	public _modelresult: GraphQLObjectType
	public _name: string
	public _data: ObjectClient
	public _commontype: CommonObjectType
	private _callback
	constructor(name: string, data: ObjectClient,callback) {
		this._commontype = new CommonObjectType()
		this._data = data
		this._name = data.name
		this._callback = callback
		let temp = this.init()
		this._model = temp.model
		this._input = temp.input
		this._modelresult = createResultModel(name, this._model)
	}
	toUpperFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}
	init() {
		let fields = {}
		let inputfields = {}
		let self = this
		let model = null
		let input = null
		let inputname = `Input${this._name}`
		if(!this._commontype.get(this._name)){
			this._data.fields.map(field => {
				let fieldtype = self._commontype.get(field.type)
				let inputfieldtype = self._commontype.get(field.type, true)
				if (field.type == 'enum' || field.type == 'enums') {
					fieldtype = createEnum(`${self._name}${self.toUpperFirst(field.name)}`, field.option['value'])
					if (field.type == 'enums') {
						fieldtype = new GraphQLList(fieldtype)
					}
					inputfieldtype = fieldtype
				} else if (field.type == "relationship" || field.type == "relationships") {
					fieldtype = self._commontype.get(field.option.map)
					inputfieldtype = GraphQLUUID
					if(this._callback && !fieldtype){
						fieldtype = this._callback(field.option.map)
					}
					if (field.type == "relationships" && fieldtype) {
						fieldtype = new GraphQLList(fieldtype)
						inputfieldtype = new GraphQLList(GraphQLUUID)
					}
				}
				if(fieldtype){
					fields[field.name] = {
						type: fieldtype
					}
				}
				
				if (field.input == undefined || field.input) {
					inputfields[field.name] = {
						type: inputfieldtype
					}
				}
	
			})
			model = new GraphQLObjectType({
				name: this._name,
				fields:{
					...BaseObjectType,
					...fields
				}
			})
			this._commontype.add(this._name, model)
			input = new GraphQLInputObjectType({
				name: inputname,
				fields: inputfields
			})
			this._commontype.add(inputname, input)
		}else{
			model = this._commontype.get(this._name)
			input = this._commontype.get(inputname)
		}
		
		if(this._commontype.get(this._name))
		return {
			input: input,
			model: model
		};

	}
	mutation() {
		return {
			...this.update()
		}
	}
	async getDocument(req){
		let app = new CMS.App()
		let doc = await app.getDocumentByToken(req.headers.authorization,req.headers.lang)
		return doc
	}

	checkLevelByschema(schema,type,curentlevel = 1){
		const checkLevel = (nodes,type,level = 0) =>{
			let maxlevel = level
			for (let index = 0; index < nodes.length; index++) {
				const selection = nodes[index];
				let fields = {}
				if(type && type.ofType){
					fields = type.ofType.getFields()
				}else{
					fields = type.getFields()
				}
				let typechild = null
				let field = fields[selection.name.value]
				if(field){
					typechild = field.type.ofType || field.type
				}
				if(selection.kind === 'Field' && selection.selectionSet && (typechild != Media) ){
					let childlevel = checkLevel(selection.selectionSet.selections,typechild,level + 1)
					if(childlevel > maxlevel){
						maxlevel = childlevel
					}
				}
			}
			return maxlevel
		}
		const getModelByschema = (nodes,schema,type) => {
			for (let index = 0; index < nodes.length; index++) {
				const selection = nodes[index];
				let childschema = schema;
				if(schema && (schema[selection.name.value])){
					childschema = schema[selection.name.value]
				}
				let typeschema = childschema.type || childschema.returnType
				if(typeschema && String(typeschema) == String(type)){
					return selection
				}else{
					if(selection.kind === 'Field' && selection.selectionSet && String(typeschema) != 'Media'){
						if(typeschema.ofType){
							typeschema = typeschema.ofType
						}
						return getModelByschema(selection.selectionSet.selections,typeschema.getFields(),type)
					}
				}
			}
			return null
		}
		let node = getModelByschema(schema.fieldNodes,schema,type)
		if(node){
			curentlevel = checkLevel(node.selectionSet.selections,type,curentlevel)
		}else{
			return 0
		}
		return curentlevel
	}
	query() {
		let schema = {}
		let self = this
		schema[this._name] = {
			type: this._model,
			async resolve(source: any, args: any, context: any, info: any) {
				// let doc = await self.getDocument(context)
				// let level = self.checkLevelByschema(info,self._model)
				// let obj = await doc?.objectByType(self._data.name,null,level)
				let obj = await self.getObject(context,info) 
				if(obj){
					return obj.toJSON();
				}
				return {}
			}
		}
		return schema
	}
	update() {
		let schema = {}
		let self = this
		schema[`update${this._name}`] = {
			type: this._modelresult,
			args:{
				input: { type: this._input }
			},
			async resolve(source: any, args: any, context: any, info: any) {
				try {
					let doc = await self.getDocument(context)
					if(!doc){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					let fields = Object.keys(args.input)
					let propertys = {}
					fields.map(field=>{
							let property  = self._data.fields.find(x=>x.name == field)
							if(property){
								propertys[field] = {
										value:args.input[field],
										schema:property
									}
							}
					})

					let obj = await doc?.objectByType(self._data.name,null,0)
					if(!obj){
						obj = await self.createObject(doc,args.input)
						obj = await self.getObject(context,info,obj.model().id)
						return {
							code:0,
							success:true,
							data:obj.toJSON()
						}
					}
					await obj.updateProperty(propertys)
					let data = await self.getObject(context,info)
					return {
						code:0,
    				success:true,
						data :data.toJSON()
					}
				} catch (error) {
					console.log(error)
				}
			},
		}
		return schema
	}
	async createObject(doc:Document,input:any){
		let obj = new Objective.InputCreateObjective();
		obj.name = this._name
		obj.type = this._name
		let fields = Object.keys(input)
		let pros: Property.InputCreateProperty[] = []
		fields.map(name => {
			let pro_find = this._data.fields.find(x => x.name == name)
			if (pro_find) {
				let property = new Property.InputCreateProperty()
				property.name = name
				let type = Property.TypeProperty
				property.type = type[pro_find.type.toUpperCase()]
				property.value = input[name]
				property.manylang = pro_find.manylang
				pros.push(property)
			}
		})
		let obj_new = await doc.createObject(obj)
		await obj_new.createPropertys(pros)
		return obj_new
	}
	async getObject(context,info,id = null){
		let doc = await this.getDocument(context)
		let level = this.checkLevelByschema(info,this._model)
		if(level <= 0){
			return null
		}
		let obj = await doc?.objectByType(this._data.name,id,level)
		return obj
	}
	
}
class GenerateModelList extends GenerateModelDict {
	mutation() {
		return {
			...this.create(),
			...this.update(),
			...this.delete(),
			...this.restore()
		}
	}
	query() {
		let schema = {}
		let self = this
		schema[this._name] = {
			type: this._model,
			args: {
				id: { type: GraphQLUUID }
			},
			async resolve(source: any, args: any, context: any, info: any) {
				// let doc = await self.getDocument(context)
				// let level = self.checkLevelByschema(info,self._model)
				// let obj = await doc?.objectByType(self._data.name,args.id,level)
				let obj = await self.getObject(context,info,args.id) 
				return obj?.toJSON();
			},
		}
		
		schema[`${this._name}s`] = {
			args: {
				input: {
					type: createFilters(this._name, this._input)
				}
			},
			type: createResultPagination(this._name, this._model),
			async resolve(source: any, args: any, context: any, info: GraphQLResolveInfo) {
				let doc = await self.getDocument(context)
				// let objs = await doc.objectsByType(self._name)
				// let total = 0
				let datas = []
				let page = (args.input?.page - 1)|| 0;
				let show =  args.input?.show || 10;
				let start = 0;
				if(show > 0){
					start = (show * page)
					// objs = objs.slice(start,start+show)
				}

				let level = self.checkLevelByschema(info,new GraphQLList(self._model))
				let [objs,total] = await doc.objectsByType(self._name,start,show,level)

				objs.map(obj=>{
					datas.push(obj.toJSON())
				})
				return {
					total: total,
					data:datas
				}
			}

		}
		return schema
	}
	create() {
		let self = this;
		let schema = {}
		schema[`create${this._name}`] = {
			type: this._modelresult,
			args: {
				input: { type: this._input }
			},
			async resolve(source: any, args: any, context: any, info: any) {
				try {
					let doc = await self.getDocument(context)
					if(!doc){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					let obj = await self.createObject(doc,args.input)
					obj = await self.getObject(context,info,obj.model().id)
					return {
						code:0,
    				success:true,
						data:obj.toJSON()
					}
				} catch (error) {
					console.log(error)
				}
			},
		}
		return schema
	}
	update() {
		let schema = {}
		let self = this
		schema[`update${this._name}`] = {
			type: this._modelresult,
			args:{
				id:{type: GraphQLUUID},
				input: { type: this._input }
			},
			async resolve(source: any, args: any, context: any, info: any) {
				try {
					let doc = await self.getDocument(context)
					if(!doc){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					let fields = Object.keys(args.input)
					let propertys = {}
					fields.map(field=>{
							let property  = self._data.fields.find(x=>x.name == field)
							if(property){
								propertys[field] = {
										value:args.input[field],
										schema:property
									}
							}
					})

					let obj = await doc.objectByType(self._name,args.id,1)
					if(!obj){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					await obj.updateProperty(propertys)
					let data = await self.getObject(context,info,args.id)
					return {
						code:0,
    				success:true,
						data :data?.toJSON()
					}
				} catch (error) {
					console.log(error)
				}
			},
		}
		return schema
	}
	delete() {
		let schema = {}
		let self  = this
		schema[`delete${this._name}`] = {
			type: ResultBase,
			args: {
				id: {
					type: GraphQLUUID
				}
			},
			async resolve(source: any, args: any, context: any, info: any) {
				try {
					let doc = await self.getDocument(context)
					if(!doc){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					let obj = await doc.object(args.id,false)
					let status = await obj.delete(false)
					return {
						code:0,
    				success:status
					}
				} catch (error) {
					console.log(error)
				}
			},
		}
		return schema
	}
	restore() {
		let schema = {}
		let self = this
		schema[`restore${this._name}`] = {
			type: ResultBase,
			args: {
				id: {
					type: GraphQLUUID
				}
			},
			async resolve(source: any, args: any, context: any, info: any) {
				try {
					let doc = await self.getDocument(context)
					if(!doc){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					let obj = await doc.object(args.id,false)
					let status = await obj.restore()
					return {
						code:0,
    				success:status
					}
				} catch (error) {
					console.log(error)
				}
			},

		}
		return schema
	}
}
class GenerateDocument {
	private _id
	private _model = {
		query: {},
		mutation: {}
	}
	constructor(id) {
		this._id = id
	}
	init() {
		let path = join(__dirname, '..', '..', '..', 'mod', this._id)
		let dirs = readdirSync(path)
		dirs.map(dir => {
			let mode = this.model(path,dir)
			this._model['query'] = {
				...this._model['query'],
				...mode.query
			}
			this._model['mutation'] = {
				...this._model['mutation'],
				...mode.mutation
			}
		})
		return this._model
	}
	model(path,name) {
		let user_template = new GenerateTemplate(this._id, name,path)
		let data = user_template.getSchema()
		let model = null
		let self = this
		const callback = (childname) =>{
			let user_template = new GenerateTemplate(this._id, childname,path)
			let data = user_template.getSchema()
			let model = new GenerateModelDict(name, data,callback)
			return model._model
		}
		if(data.type == Variables.MODEL_DICT){
			model = new GenerateModelDict(name, data,callback)
		}else{
			model = new GenerateModelList(name, data,callback)
		}
		return {
			query: model.query(),
			mutation: model.mutation()
		}
	}
}
function getSchema(id:string):GraphQLSchema{
	let generate = new GenerateDocument(id)
	let datatemp = generate.init()
	const schema = new GraphQLSchema({
		query: new GraphQLObjectType({
			name: 'Query',
			fields: datatemp.query
		}),
		mutation: new GraphQLObjectType({
			name: 'Mutation',
			fields: datatemp.mutation
		})
	});
	return schema
}
export default getSchema