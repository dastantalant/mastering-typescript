//======================================================================================================================
{
    let target = {};
    let proxy = new Proxy(target, {}); // пустой handler

    proxy.test = 5; // записываем в прокси (1)
    alert(target.test); // 5, свойство появилось в target!

    alert(proxy.test); // 5, мы также можем прочитать его из прокси (2)

    for (let key in proxy) alert(key); // test, итерация работает (3)
}
//======================================================================================================================
{
    let numbers = [0, 1, 2];

    numbers = new Proxy(numbers, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            } else {
                return 0; // значение по умолчанию
            }
        }
    });

    alert(numbers[1]); // 1
    alert(numbers[123]); // 0 (нет такого элемента)
}
//======================================================================================================================
{
    let dictionary = {
        'Hello': 'Hola',
        'Bye': 'Adiós'
    };

    dictionary = new Proxy(dictionary, {
        get(target, phrase) { // перехватываем чтение свойства в dictionary
            if (phrase in target) { // если перевод для фразы есть в словаре
                return target[phrase]; // возвращаем его
            } else {
                // иначе возвращаем непереведённую фразу
                return phrase;
            }
        }
    });

    // Запросим перевод произвольного выражения в словаре!
    // В худшем случае оно не будет переведено
    alert(dictionary['Hello']); // Hola
    alert(dictionary['Welcome to Proxy']); // Welcome to Proxy (нет перевода)
}
//======================================================================================================================
{
    let numbers = [];

    numbers = new Proxy(numbers, { // (*)
        set(target, prop, val) { // для перехвата записи свойства
            if (typeof val == 'number') {
                target[prop] = val;
                return true;
            } else {
                return false;
            }
        }
    });

    numbers.push(1); // добавилось успешно
    numbers.push(2); // добавилось успешно
    alert("Длина: " + numbers.length); // 2

    numbers.push("тест"); // TypeError (ловушка set на прокси вернула false)

    alert("Интерпретатор никогда не доходит до этой строки (из-за ошибки в строке выше)");
}
//======================================================================================================================
{
    let user = {
        name: "Вася",
        age: 30,
        _password: "***"
    };

    user = new Proxy(user, {
        ownKeys(target) {
            return Object.keys(target).filter(key => !key.startsWith('_'));
        }
    });

    // ownKeys исключил _password
    for (let key in user) alert(key); // name, затем: age

    // аналогичный эффект для этих методов:
    alert(Object.keys(user)); // name,age
    alert(Object.values(user)); // Вася,30
}
//======================================================================================================================
{
    let user = {};

    user = new Proxy(user, {
        ownKeys(target) { // вызывается 1 раз для получения списка свойств
            return ['a', 'b', 'c'];
        },

        getOwnPropertyDescriptor(target, prop) { // вызывается для каждого свойства
            return {
                enumerable: true,
                configurable: true
                /* ...другие флаги, возможно, "value: ..." */
            };
        }

    });

    alert(Object.keys(user)); // a, b, c
}
//======================================================================================================================
{
    let user = {
        name: "Вася",
        _password: "***"
    };

    user = new Proxy(user, {
        get(target, prop) {
            if (prop.startsWith('_')) {
                throw new Error("Отказано в доступе");
            } else {
                let value = target[prop];
                return (typeof value === 'function') ? value.bind(target) : value; // (*)
            }
        },
        set(target, prop, val) { // перехватываем запись свойства
            if (prop.startsWith('_')) {
                throw new Error("Отказано в доступе");
            } else {
                target[prop] = val;
                return true;
            }
        },
        deleteProperty(target, prop) { // перехватываем удаление свойства
            if (prop.startsWith('_')) {
                throw new Error("Отказано в доступе");
            } else {
                delete target[prop];
                return true;
            }
        },
        ownKeys(target) { // перехватываем попытку итерации
            return Object.keys(target).filter(key => !key.startsWith('_'));
        }
    });

    // "get" не позволяет прочитать _password
    try {
        alert(user._password); // Error: Отказано в доступе
    } catch (e) { alert(e.message); }

    // "set" не позволяет записать _password
    try {
        user._password = "test"; // Error: Отказано в доступе
    } catch (e) { alert(e.message); }

    // "deleteProperty" не позволяет удалить _password
    try {
        delete user._password; // Error: Отказано в доступе
    } catch (e) { alert(e.message); }

    // "ownKeys" исключает _password из списка видимых для итерации свойств
    for (let key in user) alert(key); // name
}
//======================================================================================================================
{
let range = {
  start: 1,
  end: 10
};

range = new Proxy(range, {
  has(target, prop) {
    return prop >= target.start && prop <= target.end
  }
});

alert(5 in range); // true
alert(50 in range); // false
}
//======================================================================================================================
{
function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    }
  });
}

function sayHi(user) {
  alert(`Привет, ${user}!`);
}

sayHi = delay(sayHi, 3000);

alert(sayHi.length); // 1 (*) прокси перенаправляет чтение свойства length на исходную функцию

sayHi("Вася"); // Привет, Вася! (через 3 секунды)
}
//======================================================================================================================
{
let user = {
  name: "Вася",
};

user = new Proxy(user, {
  get(target, prop, receiver) {
    alert(`GET ${prop}`);
    return Reflect.get(target, prop, receiver); // (1)
  },
  set(target, prop, val, receiver) {
    alert(`SET ${prop}=${val}`);
    return Reflect.set(target, prop, val, receiver); // (2)
  }
});

let name = user.name; // выводит "GET name"
user.name = "Петя"; // выводит "SET name=Петя"
}
//======================================================================================================================
{
let user = {
  _name: "Гость",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    return target[prop];
  }
});

alert(userProxy.name); // Гость
}
//======================================================================================================================
{
let user = {
  _name: "Гость",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) {
    return target[prop]; // (*) target = user
  }
});

let admin = {
  __proto__: userProxy,
  _name: "Админ"
};

// Ожидается: Админ
alert(admin.name); // выводится Гость (?!?)
}
//======================================================================================================================
{
let user = {
  _name: "Гость",
  get name() {
    return this._name;
  }
};

let userProxy = new Proxy(user, {
  get(target, prop, receiver) { // receiver = admin
    return Reflect.get(target, prop, receiver); // (*)
  }
});


let admin = {
  __proto__: userProxy,
  _name: "Админ"
};

alert(admin.name); // Админ
}
//======================================================================================================================
{
let map = new Map();

let proxy = new Proxy(map, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});

proxy.set('test', 1);
alert(proxy.get('test')); // 1 (работает!)
}
//======================================================================================================================
{
class User {
  #name = "Гость";

  getName() {
    return this.#name;
  }
}

let user = new User();

user = new Proxy(user, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == 'function' ? value.bind(target) : value;
  }
});

alert(user.getName()); // Гость
}
//======================================================================================================================
{
let allUsers = new Set();

class User {
  constructor(name) {
    this.name = name;
    allUsers.add(this);
  }
}

let user = new User("Вася");

alert(allUsers.has(user)); // true

user = new Proxy(user, {});

alert(allUsers.has(user)); // false
}
