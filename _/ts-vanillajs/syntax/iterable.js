//======================================================================================================================
let range = {
    from: 1,
    to: 5
};

// 1. вызов for..of сначала вызывает эту функцию
range[Symbol.iterator] = function () {

    // ...она возвращает объект итератора:
    // 2. Далее, for..of работает только с этим итератором,
    // запрашивая у него новые значения
    return {
        current: this.from,
        last: this.to,

        // 3. next() вызывается на каждой итерации цикла for..of
        next() {
            // 4. он должен вернуть значение в виде объекта {done:.., value :...}
            if (this.current <= this.last) {
                return { done: false, value: this.current++ };
            } else {
                return { done: true };
            }
        }
    };
};

// теперь работает!
for (let num of range) {
    print(num); // 1, затем 2, 3, 4, 5
}
//======================================================================================================================
range = {
    from: 1,
    to: 5,

    [Symbol.iterator]() {
        this.current = this.from;
        return this;
    },

    next() {
        if (this.current <= this.to) {
            return { done: false, value: this.current++ };
        } else {
            return { done: true };
        }
    }
};

for (let num of range) {
    print(num); // 1, затем 2, 3, 4, 5
}
//======================================================================================================================
for (let char of "test") {
    // срабатывает 4 раза: по одному для каждого символа
    print(char); // t, затем e, затем s, затем t
}

let str = '𝒳😂';
for (let char of str) {
    print(char); // 𝒳, а затем 😂
}
//======================================================================================================================
str = "Hello";

// делает то же самое, что и
// for (let char of str) print(char);

let iterator = str[Symbol.iterator]();

while (true) {
    let result = iterator.next();
    if (result.done) break;
    print(result.value); // выводит символы один за другим
}
//======================================================================================================================
let arrayLike = { // есть индексы и свойство length => псевдомассив
  0: "Hello",
  1: "World",
  length: 2
};

// Ошибка (отсутствует Symbol.iterator)
for (let item of arrayLike) {}
//======================================================================================================================
 arrayLike = {
  0: "Hello",
  1: "World",
  length: 2
};

let arr = Array.from(arrayLike); // (*)
print(arr.pop()); // World (метод работает)
//======================================================================================================================
