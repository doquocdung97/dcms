import UserRepository from '../database/repository/UserRepository';
import { Document } from './document';
import { User } from './user';
import { Objective } from './object';
import { Media } from './media';
import { Token } from "../common";
export class App {
	private static instance: App;
	private _documents = {}
	// private _user = new User()
	constructor() {
		const instance = App.instance;
		if (instance) {
			return instance;
		}
		App.instance = this;
	}
	async login(email: string, pass: string): Promise<User | null> {
		let repository = new UserRepository();
		let user = await repository.login(email, pass);
		if (user) {
			return new User(user);
		}
		return null;
	}
	async getDocumentByToken(token:string):Promise<Document| null>{
		return null
	}
	async getUserByToken(val) {
		let repository = new UserRepository();
		let token = new Token();
		let verify = token.verify(val);// jwt.verify(token, config.get<string>("SECRET_KEY"));
		if (verify) {
			let user_model = await repository.findOneByEmail(verify.email);
			user_model.currentDoc = user_model.connect.find((x) => x.document?.id == verify.documentid);
			let user = new User(user_model);
			if (user_model.currentDoc) {
				let doc = new Document(user, user_model.currentDoc.document)
				user.setActiveDocument(doc)
			}
			return user
		}
		return null;
	}
	addDocListen(id:string,doc:Document){
		this._documents[id] = doc
	}
	getDocListen(id:string){
		return this._documents[id]
	}
	// document(id: string): Document {
	// 	return this._documents[id]
	// }
	// documents(): Document[] {
	// 	let documents = []
	// 	let docs = Object.keys(this._documents)
	// 	docs.map(name => {
	// 		documents.push(this._documents[name])
	// 	})
	// 	return documents
	// }
	// createDocument(name: string): Document {
	// 	let doc = this._documents[name]
	// 	if (!doc) {
	// 		doc = new Document(name)
	// 		this._documents[name] = doc
	// 	}
	// 	return doc
	// }
	// removeDocument(name: string): boolean {
	// 	delete this._documents[name]
	// 	return true
	// }
}
export {
	User,
	Document,
	Objective,
	Media
}