// import { Document } from "../document";
import { User } from "../user";

export default class Main {
    private _user: User
    constructor(user: User) {
        this._user = user
    }
    // document(id: string): Document {
    //     return new Document(id, this)
    // }
    // documents(): Document[] {
    //     return
    // }
    get user(){
        return this._user
    }
}