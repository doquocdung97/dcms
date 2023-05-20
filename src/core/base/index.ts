import { Document } from './document';
export class App {
	private static instance: App;
	private _documents = {}
	constructor() {
		const instance = App.instance;
		if (instance) {
			return instance;
		}
		App.instance = this;
	}
	document(id: string): Document {
		return this._documents[id]
	}
	documents(): Document[] {
		let documents = []
		let docs = Object.keys(this._documents)
		docs.map(name => {
			documents.push(this._documents[name])
		})
		return documents
	}
	createDocument(name: string): Document {
		let doc = this._documents[name]
		if (!doc) {
			doc = new Document(name)
			this._documents[name] = doc
		}
		return doc
	}
	removeDocument(name: string): boolean {
		delete this._documents[name]
		return true
	}
}