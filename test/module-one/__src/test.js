class Test {

    set age(value) {
        this._age = value;
    }

    get age() {
        return this._age;
    }

    say() {
        console.log('name:::', this.name);
    }

    constructor(name) {

}
}

const a = () => {

}

const test = new Test('wannasky');
test.say();

