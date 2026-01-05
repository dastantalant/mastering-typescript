//======================================================================================================================
{
    let animal = {
        eats: true
    };

    let rabbit = {
        jumps: true
    };

    rabbit.__proto__ = animal;
}
//======================================================================================================================
{
    let animal = {
        eats: true
    };

    let rabbit = {
        jumps: true
    };

    rabbit.__proto__ = animal; // (*)

    // теперь мы можем найти оба свойства в rabbit:
    alert(rabbit.eats); // true (**)
    alert(rabbit.jumps); // true
}
//======================================================================================================================
{
    let animal = {
        eats: true,
        walk() {
            alert("Animal walk");
        }
    };

    let rabbit = {
        jumps: true,
        __proto__: animal
    };

    // walk взят из прототипа
    rabbit.walk(); // Animal walk
}
//======================================================================================================================
{
    let animal = {
        eats: true,
        walk() {
            alert("Animal walk");
        }
    };

    let rabbit = {
        jumps: true,
        __proto__: animal
    };

    let longEar = {
        earLength: 10,
        __proto__: rabbit
    };

    // walk взят из цепочки прототипов
    longEar.walk(); // Animal walk
    alert(longEar.jumps); // true (из rabbit)
}
//======================================================================================================================
{
    let user = {
        name: "John",
        surname: "Smith",

        set fullName(value) {
            [this.name, this.surname] = value.split(" ");
        },

        get fullName() {
            return `${this.name} ${this.surname}`;
        }
    };

    let admin = {
        __proto__: user,
        isAdmin: true
    };

    alert(admin.fullName); // John Smith (*)

    // срабатывает сеттер!
    admin.fullName = "Alice Cooper"; // (**)
    alert(admin.name); // Alice
    alert(admin.surname); // Cooper
}
//======================================================================================================================
{
    // методы animal
    let animal = {
        walk() {
            if (!this.isSleeping) {
                alert(`I walk`);
            }
        },
        sleep() {
            this.isSleeping = true;
        }
    };

    let rabbit = {
        name: "White Rabbit",
        __proto__: animal
    };

    // модифицирует rabbit.isSleeping
    rabbit.sleep();

    alert(rabbit.isSleeping); // true
    alert(animal.isSleeping); // undefined (нет такого свойства в прототипе)
}
//======================================================================================================================
{
    let animal = {
        eats: true
    };

    let rabbit = {
        jumps: true,
        __proto__: animal
    };

    // Object.keys возвращает только собственные ключи
    alert(Object.keys(rabbit)); // jumps

    // for..in проходит и по своим, и по унаследованным ключам
    for (let prop in rabbit) alert(prop); // jumps, затем eats
}
//======================================================================================================================
{
    let animal = {
        eats: true
    };

    let rabbit = {
        jumps: true,
        __proto__: animal
    };

    for (let prop in rabbit) {
        let isOwn = rabbit.hasOwnProperty(prop);

        if (isOwn) {
            alert(`Our: ${prop}`); // Our: jumps
        } else {
            alert(`Inherited: ${prop}`); // Inherited: eats
        }
    }
}
//======================================================================================================================
