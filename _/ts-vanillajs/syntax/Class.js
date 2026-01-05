//======================================================================================================================
{
    class User {

        constructor(name) {
            this.name = name;
        }

        sayHi() {
            alert(this.name);
        }

    }

    // Использование:
    let user = new User("Иван");
    user.sayHi();
}
//======================================================================================================================
{
    class User {
        constructor(name) { this.name = name; }
        sayHi() { alert(this.name); }
    }

    // доказательство: User - это функция
    alert(typeof User); // function
}
//======================================================================================================================
{
    class User {
        constructor(name) { this.name = name; }
        sayHi() { alert(this.name); }
    }

    // класс - это функция
    alert(typeof User); // function

    // ...или, если точнее, это метод constructor
    alert(User === User.prototype.constructor); // true

    // Методы находятся в User.prototype, например:
    alert(User.prototype.sayHi); // sayHi() { alert(this.name); }

    // в прототипе ровно 2 метода
    alert(Object.getOwnPropertyNames(User.prototype)); // constructor, sayHi
}
//======================================================================================================================
{
    // перепишем класс User на чистых функциях

    // 1. Создаём функцию constructor
    function User(name) {
        this.name = name;
    }
    // каждый прототип функции имеет свойство constructor по умолчанию,
    // поэтому нам нет необходимости его создавать

    // 2. Добавляем метод в прототип
    User.prototype.sayHi = function () {
        alert(this.name);
    };

    // Использование:
    let user = new User("Иван");
    user.sayHi();
}
//======================================================================================================================
{
    class User {
        constructor() { }
    }

    alert(User); // class User { ... }
}
//======================================================================================================================
{
    // Class Expression (по аналогии с Function Expression):

    let User = class {
        sayHi() {
            alert("Привет");
        }
    };
}
//======================================================================================================================
{
    // "Named Class Expression"
    // (в спецификации нет такого термина, но происходящее похоже на Named Function Expression)
    let User = class MyClass {
        sayHi() {
            alert(MyClass); // имя MyClass видно только внутри класса
        }
    };

    new User().sayHi(); // работает, выводит определение MyClass

    alert(MyClass); // ошибка, имя MyClass не видно за пределами класса
}
//======================================================================================================================
{
    function makeClass(phrase) {
        // объявляем класс и возвращаем его
        return class {
            sayHi() {
                alert(phrase);
            };
        };
    }

    // Создаём новый класс
    let User = makeClass("Привет");

    new User().sayHi(); // Привет
}
//======================================================================================================================
{
    class User {

        constructor(name) {
            // вызывает сеттер
            this.name = name;
        }

        get name() {
            return this._name;
        }

        set name(value) {
            if (value.length < 4) {
                alert("Имя слишком короткое.");
                return;
            }
            this._name = value;
        }

    }

    let user = new User("Иван");
    alert(user.name); // Иван

    user = new User(""); // Имя слишком короткое.
}
//======================================================================================================================
{
    Object.defineProperties(User.prototype, {
        name: {
            get() {
                return this._name
            },
            set(name) {
                // ...
            }
        }
    });
}
//======================================================================================================================
{
    class User {
  name = "Аноним";

  sayHi() {
    alert(`Привет, ${this.name}!`);
  }
}

new User().sayHi();
}
//======================================================================================================================
