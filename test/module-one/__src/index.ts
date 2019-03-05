

export class IndexModule {

    private name: string = 'wannasky';

    private _age: number;

    set age(value: number){
        this._age = value;
    }

    get age(): number{
        return this._age;
    }

    constructor(){

    }
}
