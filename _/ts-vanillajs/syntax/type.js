print("просто строка");
print(12345);
print(true, false, null, undefined);
print([1, 2, 3, "четыре", { пять: 5 }]);
print({ name: "Вася", age: 25, skills: ["JS", "любит log"] });

info("Сервер ответил за 150мс");
success("Пользователь успешно сохранён");
warn("Поле email пустое");
error("404 – страница не найдена");

time("цикл");
let sum = 0;
for (let i = 0; i < 1e7; i++) sum += i;
timeEnd("цикл");

print(typeof 50 + " Квартир");
print(typeof (50 + " Квартир"));

print(typeof undefined);   // undefined
print(typeof 0);           // number
print(typeof 10n);         // bigint
print(typeof true);        // boolean
print(typeof "foo");       // string
print(typeof Symbol("id"));// symbol
print(typeof Math);        // object
print(typeof null);        // object (да, это исторический баг JS)
print(typeof alert);       // function


print( Number("   123   ") ); // 123
print( Number("123z") );      // NaN (ошибка чтения числа на месте символа "z")
print( Number(true) );        // 1
print( Number(false) );       // 0


print( Boolean(1) ); // true
print( Boolean(0) ); // false

print( Boolean("Привет!") ); // true
print( Boolean("") ); // false

// 0, null, undefined, NaN, ""	false
// любое другое значение	true