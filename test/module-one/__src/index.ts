class Test {

    private _age: number;

    set age(value: number) {
        this._age = value;
    }

    get age(): number {
        return this._age;
    }

    say() {
        console.log('name:::', this.name);
    }

    constructor(private name: string) {

    }
}

const a = () => {

}

const test = new Test('wannasky');
test.say();

