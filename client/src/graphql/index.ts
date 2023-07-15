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
	GraphQLFieldConfig
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
class GenerateModel {
	private _model: GraphQLObjectType
	private _input: GraphQLInputObjectType
	private _modelresult: GraphQLObjectType
	private _id: string
	private _name: string
	private _data: ObjectClient
	private _commontype: CommonObjectType
	constructor(id: string, name: string, data: ObjectClient) {
		this._commontype = new CommonObjectType()
		this._data = data
		this._id = id
		this._name = data.name
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
				if (field.type == "relationships") {
					fieldtype = new GraphQLList(fieldtype)
					inputfieldtype = new GraphQLList(GraphQLUUID)
				}
			}
			fields[field.name] = {
				type: fieldtype,
				// async resolve(source: any, args: any, context: any, info: any) {
				// 	console.log(source, args, context, info)
				// },
				// subscribe(source: any, args: any, context: any, info: any) {
				// 	console.log(source, args, context, info)
				// }
			}
			if (field.input == undefined || field.input) {
				inputfields[field.name] = {
					type: inputfieldtype
				}
			}

		})
		let model = new GraphQLObjectType({
			name: this._name,
			fields:{
				...BaseObjectType,
				...fields
			}
		})
		this._commontype.add(this._name, model)
		return {
			input: new GraphQLInputObjectType({
				name: `Input${this._name}`,
				fields: inputfields
			}),
			model: model
		};

	}
	mutation() {
		if(this._data.type == Variables.MODEL_DICT){
			return {
				...this.update()
			}
		}
		return {
			...this.create(),
			...this.update(),
			...this.delete(),
			...this.restore()
		}
	}
	async getDocument(req){
		let app = new CMS.App()
		let doc = await app.getDocumentByToken(req.headers.authorization)
		// if(!doc){
		// 	throw Error("Document not found")
		// }
		return doc
	}
	checkLevel(nodes,level = 0){
		for (let index = 0; index < nodes.length; index++) {
			const selection = nodes[index];
			if(selection.kind === 'Field' && selection.name.value != 'Media' && selection.selectionSet){
				level++
				level = this.checkLevel(selection.selectionSet.selections,level)
				return level
			}
		}
		return level
	}
	query() {
		let schema = {}
		let self = this
		if(self._data.type == Variables.MODEL_DICT){
			schema[this._name] = {
				type: this._model,
				async resolve(source: any, args: any, context: any, info: any) {
					let level = self.checkLevel(info.fieldNodes)

					// console.log(source, args, context, info)
					let doc = await self.getDocument(context)
					let obj = await doc?.objectByType(self._data.name,level)
					if(obj){
						return obj.toJson();
					}
					return {}
				},
				// subscribe(source: any, args: any, context: any, info: any) {
				// 	console.log(source, args, context, info)
				// }
			}
			return schema
		}
		schema[this._name] = {
			type: this._model,
			args: {
				id: { type: GraphQLUUID }
			},
			async resolve(source: any, args: any, context: any, info: any) {
				let doc = await self.getDocument(context)
				let obj = await doc?.object(args.id)
				return obj?.toJson();
			},
		}
		
		schema[`${this._name}s`] = {
			args: {
				filter: {
					type: createFilters(this._name, this._input)
				}
			},
			type: createResultPagination(this._name, this._model),
			async resolve(source: any, args: any, context: any, info: any) {
				let doc = await self.getDocument(context)
				// let objs = await doc.objectsByType(self._name)
				// let total = 0
				let datas = []
				let page = (args.filter?.page - 1)|| 0;
				let show =  args.filter?.show || 10;
				let start = 0;
				if(show > 0){
					start = (show * page)
					// objs = objs.slice(start,start+show)
				}
				let [objs,total] = await doc.objectsByType(self._name,start,show)

				objs.map(obj=>{
					// let dict = {}
					// self._data.fields.map(field=>{
					// 	dict[field.name] = obj.getValue(field.name)
					// })
					datas.push(obj.toJson())
				})
				return {
					// page: args.filter?.page || 0,
					total: total,
					// show: args.filter?.show || 10,
					data:datas
				}
			},
			// subscribe(source: any, args: any, context: any, info: any) {
			// 	console.log('subscribe', source, args, context, info)
			// 	return {}
			// },
			// description: 'the database user\'s id',

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
					return {
						code:0,
    				success:true,
						data:obj.toJson()
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
		let args = {
			input: { type: this._input }
		}
		if(this._data.type == Variables.MODEL_LIST){
			args["id"] = {
				type: GraphQLUUID
			}
		}

		schema[`update${this._name}`] = {
			type: this._modelresult,
			args,
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

					let obj = null;
					if(self._data.type == Variables.MODEL_DICT){
						obj = await doc?.objectByType(self._data.name,0)
						if(!obj){
							obj = await self.createObject(doc,args.input)
							return {
								code:0,
								success:true,
								data:obj.toJson()
							}
						}
					}else{
						obj = await doc.object(args.id)
					}
					if(!obj){
						return {
							code:1,
							success:false,
							data:null
						}
					}
					
					return {
						code:0,
    				success:true,
						data:obj.updateProperty(propertys)
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
				pros.push(property)
			}
		})
		let obj_new = await doc.createObject(obj)
		await obj_new.createPropertys(pros)
		return obj_new
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
	private _type = {}
	private _model = {
		query: {},
		mutation: {}
	}
	constructor(id) {
		this._id = id
		this._type = {
			'string': GraphQLString,
			'number': GraphQLInt,
			'media': Media,
			'medias': new GraphQLList(Media),
			'inputmedia': GraphQLUUID,
			'inputmedias': new GraphQLList(GraphQLUUID),
			'UUID': GraphQLUUID,
		}
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
		let data = user_template.getSchame()

		let model = new GenerateModel(this._id, name, data)
		return {
			query: model.query(),
			mutation: model.mutation()
		}
	}
}
let doc_id = '0df5c8f4-4fcd-425b-bf77-73a19c11969d'
let generate = new GenerateDocument(doc_id)
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

export default schema