//======================================================================================================================
{
    class Animal {
        constructor(name) {
            this.speed = 0;
            this.name = name;
        }
        run(speed) {
            this.speed = speed;
            alert(`${this.name} бежит со скоростью ${this.speed}.`);
        }
        stop() {
            this.speed = 0;
            alert(`${this.name} стоит неподвижно.`);
        }
    }

    let animal = new Animal("Мой питомец");

    class Rabbit extends Animal {
        hide() {
            alert(`${this.name} прячется!`);
        }
    }

    let rabbit = new Rabbit("Белый кролик");

    rabbit.run(5); // Белый кролик бежит со скоростью 5.
    rabbit.hide(); // Белый кролик прячется!
}
//======================================================================================================================
{
    class Animal {

        constructor(name) {
            this.speed = 0;
            this.name = name;
        }

        run(speed) {
            this.speed = speed;
            alert(`${this.name} бежит со скоростью ${this.speed}.`);
        }

        stop() {
            this.speed = 0;
            alert(`${this.name} стоит.`);
        }

    }

    class Rabbit extends Animal {
        hide() {
            alert(`${this.name} прячется!`);
        }

        stop() {
            super.stop(); // вызываем родительский метод stop
            this.hide(); // и затем hide
        }
    }

    let rabbit = new Rabbit("Белый кролик");

    rabbit.run(5); // Белый кролик бежит со скоростью 5.
    rabbit.stop(); // Белый кролик стоит. Белый кролик прячется!
}
//======================================================================================================================
{
    class Animal {

        constructor(name) {
            this.speed = 0;
            this.name = name;
        }

        // ...
    }

    class Rabbit extends Animal {

        constructor(name, earLength) {
            super(name);
            this.earLength = earLength;
        }

        // ...
    }

    // теперь работает
    let rabbit = new Rabbit("Белый кролик", 10);
    alert(rabbit.name); // Белый кролик
    alert(rabbit.earLength); // 10
}
//======================================================================================================================
{
    class Animal {
        name = 'animal';

        constructor() {
            alert(this.name); // (*)
        }
    }

    class Rabbit extends Animal {
        name = 'rabbit';
    }

    new Animal(); // animal
    new Rabbit(); // animal
}
//======================================================================================================================
{
    class Animal {
        showName() {  // вместо this.name = 'animal'
            alert('animal');
        }

        constructor() {
            this.showName(); // вместо alert(this.name);
        }
    }

    class Rabbit extends Animal {
        showName() {
            alert('rabbit');
        }
    }

    new Animal(); // animal
    new Rabbit(); // rabbit
}
//======================================================================================================================
