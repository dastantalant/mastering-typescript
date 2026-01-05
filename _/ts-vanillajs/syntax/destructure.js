//======================================================================================================================
// у нас есть массив с именем и фамилией
let arr = ["Ilya", "Kantor"];

// деструктурирующее присваивание
// записывает firstName = arr[0]
// и surname = arr[1]
let [firstName, surname] = arr;

alert(firstName); // Ilya
alert(surname);  // Kantor
//======================================================================================================================
[firstName, surname] = "Ilya Kantor".split(' ');
alert(firstName); // Ilya
alert(surname);  // Kantor
//======================================================================================================================
// второй элемент не нужен
let title;
[firstName, , title] = ["Julius", "Caesar", "Consul", "of the Roman Republic"];

alert(title); // Consul
//======================================================================================================================
let [a, b, c] = "abc";
let [one, two, three] = new Set([1, 2, 3]);
//======================================================================================================================
let user = {};
[user.name, user.surname] = "Ilya Kantor".split(' ');

alert(user.name); // Ilya
alert(user.surname); // Kantor
//======================================================================================================================
user = {
    name: "John",
    age: 30
};

// цикл по ключам и значениям
for (let [key, value] of Object.entries(user)) {
    alert(`${key}:${value}`); // name:John, затем age:30
}
//======================================================================================================================
user = new Map();
user.set("name", "John");
user.set("age", "30");

// Map перебирает как пары [ключ, значение], что очень удобно для деструктурирования
for (let [key, value] of user) {
    alert(`${key}:${value}`); // name:John, затем age:30
}
//======================================================================================================================
let guest = "Jane";
let admin = "Pete";

// Давайте поменяем местами значения: сделаем guest = "Pete", а admin = "Jane"
[guest, admin] = [admin, guest];

alert(`${guest} ${admin}`); // Pete Jane (успешно заменено!)
//======================================================================================================================
let [name1, name2] = ["Julius", "Caesar", "Consul", "of the Roman Republic"];

alert(name1); // Julius
alert(name2); // Caesar
// Дальнейшие элементы нигде не присваиваются
//======================================================================================================================
let rest;
[name1, name2, ...rest] = ["Julius", "Caesar", "Consul", "of the Roman Republic"];

// rest это массив элементов, начиная с 3-го
alert(rest[0]); // Consul
alert(rest[1]); // of the Roman Republic
alert(rest.length); // 2
//======================================================================================================================
[firstName, surname] = [];

alert(firstName); // undefined
alert(surname); // undefined
//======================================================================================================================
// значения по умолчанию
let name;
[name = "Guest", surname = "Anonymous"] = ["Julius"];

alert(name);    // Julius (из массива)
alert(surname); // Anonymous (значение по умолчанию)
//======================================================================================================================
let options = {
    title1: "Menu",
    width: 100,
    height: 200
};

let { title1, width, height } = options;

alert(title1);  // Menu
alert(width);  // 100
alert(height); // 200
//======================================================================================================================
options = {
    title: "Menu"
};

let { width2 = 100, height2 = 200, title2 } = options;

alert(title2);  // Menu
alert(width2);  // 100
alert(height2); // 200
//======================================================================================================================
options = {
    title3: "Menu",
    height: 200,
    width: 100
};

// title = свойство с именем title
// rest = объект с остальными свойствами
let { title3, ...rest3 } = options;

// сейчас title="Menu", rest={height: 200, width: 100}
alert(rest3.height);  // 200
alert(rest3.width);   // 100
//======================================================================================================================
// сейчас всё работает
({ title, width, height } = { title: "Menu", width: 200, height: 100 });

alert(title); // Menu
//======================================================================================================================
// Вложенная деструктуризация
options = {
    size: {
        width: 100,
        height: 200
    },
    items: ["Cake", "Donut"],
    extra: true
};

// деструктуризация разбита на несколько строк для ясности
let {
    size: { // положим size сюда
        width4,
        height4
    },
    items: [item1, item2], // добавим элементы к items
    title4 = "Menu" // отсутствует в объекте (используется значение по умолчанию)
} = options;

alert(title4);  // Menu
alert(width4);  // 100
alert(height4); // 200
alert(item1);  // Cake
alert(item2);  // Donut
//======================================================================================================================
options = {
  title: "My menu",
  items: ["Item1", "Item2"]
};

// ...и она немедленно извлекает свойства в переменные
function showMenu({title = "Untitled", width = 200, height = 100, items = []}) {
  // title, items – взято из options,
  // width, height – используются значения по умолчанию
  alert( `${title} ${width} ${height}` ); // My Menu 200 100
  alert( items ); // Item1, Item2
}

showMenu(options);
//======================================================================================================================
options = {
  title: "My menu",
  items: ["Item1", "Item2"]
};

function showMenu({
  title = "Untitled",
  width: w = 100,  // width присваиваем в w
  height: h = 200, // height присваиваем в h
  items: [item1, item2] // первый элемент items присваивается в item1, второй в item2
}) {
  alert( `${title} ${w} ${h}` ); // My Menu 100 200
  alert( item1 ); // Item1
  alert( item2 ); // Item2
}

showMenu(options);
//======================================================================================================================
function showMenu({ title = "Menu", width = 100, height = 200 } = {}) {
  alert( `${title} ${width} ${height}` );
}

showMenu(); // Menu 100 200
//======================================================================================================================
