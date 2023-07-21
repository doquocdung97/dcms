import {
	GraphQLBoolean,
	GraphQLObjectType,
	GraphQLEnumType,
	GraphQLInt,
	GraphQLList,
	GraphQLString,
	GraphQLInputObjectType
} from "graphql";
import { GraphQLDatetime } from "../scalartype";

export const BaseObjectType = {
	id: {
		type: GraphQLString
	},
	createdAt: {
		type: GraphQLDatetime,
	},
	updatedAt: {
		type: GraphQLDatetime,
	}
}

export const BaseResultCode = new GraphQLEnumType({
	name: "BaseResultCode",
	values: {
		B000: {
			value: 0
		},
		B001: {
			value: 1
		}
	},
})

export function createEnum(name: string, values: string[]): GraphQLEnumType {
	let enumvalues = {}
	values?.map((value, i) => {
		enumvalues[value] = { value: i }
	})

	return new GraphQLEnumType({
		name: `${name}Enum`,
		values: enumvalues,
	})
}

export function createResultModel(name: string, model: GraphQLObjectType): GraphQLObjectType {
	// let result = ResultBase
	// result.getFields["data"] = {
	// 	type: model
	// }
	// return {
	// 	...result,
	// 	name: `Result${name}`
	// }
	return new GraphQLObjectType({
		name: `${name}Result`,
		fields: {
			code: {
				type: BaseResultCode
			},
			success: {
				type: GraphQLBoolean
			},
			data: {
				type: model
			}
		}
	})
}
export function createFilters(name: string, model: GraphQLInputObjectType): GraphQLInputObjectType {
	return new GraphQLInputObjectType({
		name: `${name}Filter`,
		fields: {
			page: {
				type: GraphQLInt,
				defaultValue: 0

			},
			show: {
				type: GraphQLInt,
				defaultValue: 10
			},
			// filter: {
			// 	type: model
			// }
		}
	})
}

export function createResultPagination(name: string, model: GraphQLObjectType): GraphQLObjectType {
	return new GraphQLObjectType({
		name: `Pagination${name}Result`,
		fields: {
			total: {
				type: GraphQLInt
			},
			// page: {
			// 	type: GraphQLInt
			// },
			// show: {
			// 	type: GraphQLInt
			// },
			data: {
				type: new GraphQLList(model)
			}
		}
	})
}
export const ResultBase = new GraphQLObjectType({
	name: "BaseResult",
	fields: {
		code: {
			type: BaseResultCode
		},
		success: {
			type: GraphQLBoolean
		},
	}
})

export const Media = new GraphQLObjectType({
	name: 'Media',
	fields: {
		id: {
			type: GraphQLString
		},
		name: {
			type: GraphQLString,
		},
		url: {
			type: GraphQLString,
		},
		...BaseObjectType
	},
});
