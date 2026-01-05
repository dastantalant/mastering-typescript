//======================================================================================================================
{
    class Rabbit { }
    let rabbit = new Rabbit();

    // это объект класса Rabbit?
    alert(rabbit instanceof Rabbit); // true
}
//======================================================================================================================
{
    // вместо класса
    function Rabbit() { }

    alert(new Rabbit() instanceof Rabbit); // true
}
//======================================================================================================================
{
    let arr = [1, 2, 3];
    alert(arr instanceof Array); // true
    alert(arr instanceof Object); // true
}
//======================================================================================================================
{
    // проверка instanceof будет полагать,
    // что всё со свойством canEat - животное Animal
    class Animal {
        static [Symbol.hasInstance](obj) {
            if (obj.canEat) return true;
        }
    }

    let obj = { canEat: true };
    alert(obj instanceof Animal); // true: вызван Animal[Symbol.hasInstance](obj)
}
//======================================================================================================================
{
    class Animal { }
    class Rabbit extends Animal { }

    let rabbit = new Rabbit();
    alert(rabbit instanceof Animal); // true
}
//======================================================================================================================
{
    function Rabbit() { }
    let rabbit = new Rabbit();

    // заменяем прототип
    Rabbit.prototype = {};

    // ...больше не rabbit!
    alert(rabbit instanceof Rabbit); // false
}
//======================================================================================================================
{
    let obj = {};

    alert(obj); // [object Object]
    alert(obj.toString()); // то же самое
}
//======================================================================================================================
{
    // скопируем метод toString в переменную для удобства
    let objectToString = Object.prototype.toString;

    // какой это тип?
    let arr = [];

    alert(objectToString.call(arr)); // [object Array]
}
//======================================================================================================================
{
    let s = Object.prototype.toString;

    alert(s.call(123)); // [object Number]
    alert(s.call(null)); // [object Null]
    alert(s.call(alert)); // [object Function]
}
//======================================================================================================================
{
    let user = {
        [Symbol.toStringTag]: "User"
    };

    alert({}.toString.call(user)); // [object User]
}
//======================================================================================================================
{
    // toStringTag для браузерного объекта и класса
    alert(window[Symbol.toStringTag]); // window
    alert(XMLHttpRequest.prototype[Symbol.toStringTag]); // XMLHttpRequest

    alert({}.toString.call(window)); // [object Window]
    alert({}.toString.call(new XMLHttpRequest())); // [object XMLHttpRequest]
}
//======================================================================================================================
