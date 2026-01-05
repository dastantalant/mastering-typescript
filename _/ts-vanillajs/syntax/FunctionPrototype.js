//======================================================================================================================
{
    let animal = {
        eats: true
    };

    function Rabbit(name) {
        this.name = name;
    }

    Rabbit.prototype = animal;

    let rabbit = new Rabbit("White Rabbit"); //  rabbit.__proto__ == animal

    alert(rabbit.eats); // true
}
//======================================================================================================================
{
    function Rabbit() { }
    // по умолчанию:
    // Rabbit.prototype = { constructor: Rabbit }

    alert(Rabbit.prototype.constructor == Rabbit); // true
}
//======================================================================================================================
{
    function Rabbit() { }
    // по умолчанию:
    // Rabbit.prototype = { constructor: Rabbit }

    let rabbit = new Rabbit(); // наследует от {constructor: Rabbit}

    alert(rabbit.constructor == Rabbit); // true (свойство получено из прототипа)
}
//======================================================================================================================
{
    function Rabbit() { }
    Rabbit.prototype = {
        jumps: true
    };

    let rabbit = new Rabbit();
    alert(rabbit.constructor === Rabbit); // false
}
//======================================================================================================================
{
    function Rabbit() { }

    // Не перезаписываем Rabbit.prototype полностью,
    // а добавляем к нему свойство
    Rabbit.prototype.jumps = true
    // Прототип по умолчанию сохраняется, и мы всё ещё имеем доступ к Rabbit.prototype.constructor
}
//======================================================================================================================
{
    Rabbit.prototype = {
        jumps: true,
        constructor: Rabbit
    };

    // теперь свойство constructor снова корректное, так как мы добавили его
}
//======================================================================================================================
