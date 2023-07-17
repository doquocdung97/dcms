import { Client } from "@elastic/elasticsearch"
import { CatIndicesIndicesRecord, InfoResponse, SearchHit } from "@elastic/elasticsearch/lib/api/types";
import { LoggerHelper } from "../common";
import { Config } from "config";
import { Variable } from "../constants";

class ClientSearch {
	#logger:LoggerHelper;
	private static instance: ClientSearch;
	private _client: Client
	constructor() {
		const instance = ClientSearch.instance;
		const config = new Config()
		if (instance) {
			return instance;
		}
		try {
			this._client = new Client({
				node: config.get<string>(Variable.ELASTIC_HOST)
			})
		} catch (error) {
			this.#logger.error(error)
		}
		this.#logger = new LoggerHelper('Client Search');
		ClientSearch.instance = this;
	}
	get client() {
		return this._client
	}
}
export class SearchService {
	#logger:LoggerHelper;
	
	private _search: InfoResponse

	private _client: Client;
	private static instance: SearchService;

	constructor() {
		const instance = SearchService.instance;
		if (instance) {
			return instance;
		}
		let search = new ClientSearch()
		this._client = search.client
		this.#logger = new LoggerHelper('Search Service');
		SearchService.instance = this;
	}

	async get(): Promise<Index[]>;
	async get(name: string): Promise<Index>;
	async get(name: string = null): Promise<Index | Index[]> {
		let s: Index[] = []
		try {
			if (name) {
				let item = await this._client.cat.indices({ index: name, format: 'json' })
				if (item.length > 0)
					return new Index(item[0])
			}
			const indices = await this._client.cat.indices({ format: 'json' })
			indices.map(item => {
				s.push(new Index(item))
			})
		} catch (error) {
			this.#logger.error(error)
		}
		return s
	}

	async create(name): Promise<Index> {
		try {
			let result = await this._client.indices.create({ index: name })
			if (result) {
				return this.get(name)
			}
		} catch (error) {
			this.#logger.error(error)
		}
		return null
	}
}
class Index {
	#logger:LoggerHelper;
	#client: Client
	public uuid: string
	public status: string
	public name: string
	public count: number
	constructor(data: CatIndicesIndicesRecord) {
		let search = new ClientSearch()
		this.#client = search.client
		this.name = data.index
		this.uuid = data.uuid
		this.status = data.status
		this.count = parseInt(data["docs.count"], 0)
		this.#logger = new LoggerHelper('Search Index');
	}

	async get(): Promise<Document[]>;
	async get(id: string): Promise<Document>;
	async get(id: string = null) {
		let s = []
		try {
			if (id) {
				let data = await this.#client.get({
					index: this.name,
					id: id
				})
				return new Document(data)
			}

			let data = await this.#client.search({
				index: this.name,
				body: {
					query: {
						"match_all": {}
					}
				}
			})
			data.hits.hits.map(item => {
				s.push(new Document(item))
			})
		} catch (error) {
			this.#logger.error(error)
		}
		return s
	}

	async query(): Promise<Document[]> {
		let s = []
		try {
			let data = await this.#client.search({
				index: this.name,
				body: {
					query: {
						"match_all": {}
					}
				}
			})
			data.hits.hits.map(item => {
				s.push(new Document(item))
			})
		} catch (error) {
			this.#logger.error(error)
		}
		return s
	}

	async create(id: string, data: any) {
		try {
			let record = await this.#client.index({
				index: this.name,
				id: id,
				document: data
			})
			return new Document(record)
		} catch (error) {
			this.#logger.error(error)
		}
		return null
	}
}
class Document {
	#client: Client
	#name: string
	public id: string
	#logger:LoggerHelper;
	public data: any
	constructor(data: SearchHit) {
		let search = new ClientSearch()
		this.#client = search.client
		this.#name = data._index
		this.id = data._id
		this.data = data._source
		this.#logger = new LoggerHelper('Search Document');
	}
	async update(data: any) {
		try {
			let record = await this.#client.index({
				index: this.#name,
				id: this.id,
				document: data
			})
			return new Document(record)
		} catch (error) {
			this.#logger.error(error)
		}
		return null
	}
	async delete() {
		try {
			let record = await this.#client.delete({
				index: this.#name,
				id: this.id
			})
			return false
		} catch (error) {
			this.#logger.error(error)
		}
	}
}