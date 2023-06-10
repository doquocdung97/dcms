import { FileHelper ,LoggerHelper} from "./../common";
export class Config {
	private static instance: Config;
	private _data: any = {}
	private _logger = new LoggerHelper('Config')
	constructor() {
		const instance = Config.instance;
		if (instance) {
			return instance;
		}
		Config.instance = this;
	}
	async load(path:string) {
		let _file = new FileHelper();
		try {
			let data = await _file.readFile(path)
    	this._data = JSON.parse(data.toString());
		} catch (error) {
			let msg = `load file config failed ${error}`
			this._logger.error(msg)
			throw new Error(msg)
		}
	}
	get<T>(name: string, defaultdata: T = null): T {
		return this._data[name] || defaultdata;
	}
}