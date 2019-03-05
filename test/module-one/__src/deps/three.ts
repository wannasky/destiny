import {Two} from "./two";

export class Three extends Two{

    private _age: number;

    set age(value: number){
        this._age = value;
    }

    get age(): number {
        return this._age;
    }

    constructor(){
        super('three');
    }
}
