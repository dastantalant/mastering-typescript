//======================================================================================================================
let user = {
    name: "John",
    age: 30,

    toString() {
        return `{name: "${this.name}", age: ${this.age}}`;
    }
};

alert(user); // {name: "John", age: 30}
//======================================================================================================================
let student = {
    name: 'John',
    age: 30,
    isAdmin: false,
    courses: ['html', 'css', 'js'],
    wife: null
};

let json = JSON.stringify(student);

alert(typeof json); // мы получили строку!

alert(json);
/* выведет объект в формате JSON:
{
  "name": "John",
  "age": 30,
  "isAdmin": false,
  "courses": ["html", "css", "js"],
  "wife": null
}
*/
//======================================================================================================================
// число в JSON остаётся числом
alert(JSON.stringify(1)) // 1

// строка в JSON по-прежнему остаётся строкой, но в двойных кавычках
alert(JSON.stringify('test')) // "test"

alert(JSON.stringify(true)); // true

alert(JSON.stringify([1, 2, 3])); // [1,2,3]
//======================================================================================================================
user = {
    sayHi() { // будет пропущено
        alert("Hello");
    },
    [Symbol("id")]: 123, // также будет пропущено
    something: undefined // как и это - пропущено
};

alert(JSON.stringify(user)); // {} (пустой объект)
//======================================================================================================================
let meetup = {
    title: "Conference",
    room: {
        number: 23,
        participants: ["john", "ann"]
    }
};

alert(JSON.stringify(meetup));
/* вся структура преобразована в строку:
{
  "title":"Conference",
  "room":{"number":23,"participants":["john","ann"]},
}
*/
//======================================================================================================================
let room = {
    number: 23
};

meetup = {
    title: "Conference",
    participants: ["john", "ann"]
};

meetup.place = room;       // meetup ссылается на room
room.occupiedBy = meetup; // room ссылается на meetup

JSON.stringify(meetup); // Ошибка: Преобразование цикличной структуры в JSON
//======================================================================================================================
room = {
    number: 23
};

meetup = {
    title: "Conference",
    participants: [{ name: "John" }, { name: "Alice" }],
    place: room // meetup ссылается на room
};

room.occupiedBy = meetup; // room ссылается на meetup

alert(JSON.stringify(meetup, ['title', 'participants']));
// {"title":"Conference","participants":[{},{}]}
//======================================================================================================================
room = {
    number: 23
};

meetup = {
    title: "Conference",
    participants: [{ name: "John" }, { name: "Alice" }],
    place: room // meetup ссылается на room
};

room.occupiedBy = meetup; // room ссылается на meetup

alert(JSON.stringify(meetup, ['title', 'participants', 'place', 'name', 'number']));
/*
{
  "title":"Conference",
  "participants":[{"name":"John"},{"name":"Alice"}],
  "place":{"number":23}
}
*/
//======================================================================================================================
room = {
    number: 23
};

meetup = {
    title: "Conference",
    participants: [{ name: "John" }, { name: "Alice" }],
    place: room // meetup ссылается на room
};

room.occupiedBy = meetup; // room ссылается на meetup

alert(JSON.stringify(meetup, function replacer(key, value) {
    alert(`${key}: ${value}`);
    return (key == 'occupiedBy') ? undefined : value;
}));

/* пары ключ:значение, которые приходят в replacer:
:             [object Object]
title:        Conference
participants: [object Object],[object Object]
0:            [object Object]
name:         John
1:            [object Object]
name:         Alice
place:        [object Object]
number:       23
occupiedBy: [object Object]
*/
//======================================================================================================================
user = {
    name: "John",
    age: 25,
    roles: {
        isAdmin: false,
        isEditor: true
    }
};

alert(JSON.stringify(user, null, 2));
/* отступ в 2 пробела:
{
  "name": "John",
  "age": 25,
  "roles": {
    "isAdmin": false,
    "isEditor": true
  }
}
*/

/* для JSON.stringify(user, null, 4) результат содержит больше отступов:
{
    "name": "John",
    "age": 25,
    "roles": {
        "isAdmin": false,
        "isEditor": true
    }
}
*/
//======================================================================================================================
room = {
    number: 23
};

meetup = {
    title: "Conference",
    date: new Date(Date.UTC(2017, 0, 1)),
    room
};

alert(JSON.stringify(meetup));
/*
  {
    "title":"Conference",
    "date":"2017-01-01T00:00:00.000Z",  // (1)
    "room": {"number":23}               // (2)
  }
*/
//======================================================================================================================
room = {
    number: 23,
    toJSON() {
        return this.number;
    }
};

meetup = {
    title: "Conference",
    room
};

alert(JSON.stringify(room)); // 23

alert(JSON.stringify(meetup));
/*
  {
    "title":"Conference",
    "room": 23
  }
*/
//======================================================================================================================
// строковый массив
let numbers = "[0, 1, 2, 3]";

numbers = JSON.parse(numbers);

alert(numbers[1]); // 1

user = '{ "name": "John", "age": 35, "isAdmin": false, "friends": [0,1,2,3] }';

user = JSON.parse(user);

alert(user.friends[1]); // 1

json = `{
  name: "John",                     // Ошибка: имя свойства без кавычек
  "surname": 'Smith',               // Ошибка: одинарные кавычки в значении (должны быть двойными)
  'isAdmin': false,                 // Ошибка: одинарные кавычки в ключе (должны быть двойными)
  "birthday": new Date(2000, 2, 3), // Ошибка: не допускается конструктор "new", только значения
  "gender": "male"                  // Ошибка: отсутствует запятая после непоследнего свойства
  "friends": [0,1,2,3],             // Ошибка: не должно быть запятой после последнего свойства
}`;
//======================================================================================================================
str = '{"title":"Conference","date":"2017-11-30T12:00:00.000Z"}';

meetup = JSON.parse(str);

alert(meetup.date.getDate()); // Ошибка!

str = '{"title":"Conference","date":"2017-11-30T12:00:00.000Z"}';

meetup = JSON.parse(str, function (key, value) {
    if (key == 'date') return new Date(value);
    return value;
});

alert(meetup.date.getDate()); // 30 - теперь работает!

let schedule = `{
  "meetups": [
    {"title":"Conference","date":"2017-11-30T12:00:00.000Z"},
    {"title":"Birthday","date":"2017-04-18T12:00:00.000Z"}
  ]
}`;

schedule = JSON.parse(schedule, function (key, value) {
    if (key == 'date') return new Date(value);
    return value;
});

alert(schedule.meetups[1].date.getDate()); // 18 - отлично!
//======================================================================================================================
