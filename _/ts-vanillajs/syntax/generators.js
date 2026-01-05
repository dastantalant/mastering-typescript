//======================================================================================================================
{
    function* generateSequence() {
        yield 1;
        yield 2;
        return 3;
    }
}
//======================================================================================================================
{
    function* generateSequence() {
        yield 1;
        yield 2;
        return 3;
    }

    // "функция-генератор" создаёт объект "генератор"
    let generator = generateSequence();
    alert(generator); // [object Generator]
}
//======================================================================================================================
{
    function* generateSequence() {
        yield 1;
        yield 2;
        return 3;
    }

    let generator = generateSequence();

    for (let value of generator) {
        alert(value); // 1, затем 2
    }
}
//======================================================================================================================
{
    function* generateSequence() {
        yield 1;
        yield 2;
        yield 3;
    }

    let generator = generateSequence();

    for (let value of generator) {
        alert(value); // 1, затем 2, затем 3
    }
}
//======================================================================================================================
{
    function* generateSequence() {
        yield 1;
        yield 2;
        yield 3;
    }

    let sequence = [0, ...generateSequence()];

    alert(sequence); // 0, 1, 2, 3
}
//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        // for..of range вызывает этот метод один раз в самом начале
        [Symbol.iterator]() {
            // ...он возвращает перебираемый объект:
            // далее for..of работает только с этим объектом, запрашивая следующие значения
            return {
                current: this.from,
                last: this.to,

                // next() вызывается при каждой итерации цикла for..of
                next() {
                    // нужно вернуть значение как объект {done:.., value :...}
                    if (this.current <= this.last) {
                        return { done: false, value: this.current++ };
                    } else {
                        return { done: true };
                    }
                }
            };
        }
    };

    // при переборе объекта range будут выведены числа от range.from до range.to
    alert([...range]); // 1,2,3,4,5
}
//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        *[Symbol.iterator]() { // краткая запись для [Symbol.iterator]: function*()
            for (let value = this.from; value <= this.to; value++) {
                yield value;
            }
        }
    };

    alert([...range]); // 1,2,3,4,5
}
//======================================================================================================================
{
    function* generateSequence(start, end) {
        for (let i = start; i <= end; i++) yield i;
    }
}
//======================================================================================================================
{
    function* generateSequence(start, end) {
        for (let i = start; i <= end; i++) yield i;
    }

    function* generatePasswordCodes() {

        // 0..9
        yield* generateSequence(48, 57);

        // A..Z
        yield* generateSequence(65, 90);

        // a..z
        yield* generateSequence(97, 122);

    }

    let str = '';

    for (let code of generatePasswordCodes()) {
        str += String.fromCharCode(code);
    }

    alert(str); // 0..9A..Za..z
}
//======================================================================================================================
{
    function* generateSequence(start, end) {
        for (let i = start; i <= end; i++) yield i;
    }

    function* generateAlphaNum() {

        // yield* generateSequence(48, 57);
        for (let i = 48; i <= 57; i++) yield i;

        // yield* generateSequence(65, 90);
        for (let i = 65; i <= 90; i++) yield i;

        // yield* generateSequence(97, 122);
        for (let i = 97; i <= 122; i++) yield i;

    }

    let str = '';

    for (let code of generateAlphaNum()) {
        str += String.fromCharCode(code);
    }

    alert(str); // 0..9a..zA..Z
}
//======================================================================================================================
{
    function* gen() {
        // Передаём вопрос во внешний код и ожидаем ответа
        let result = yield "2 + 2 = ?"; // (*)

        alert(result);
    }

    let generator = gen();

    let question = generator.next().value; // <-- yield возвращает значение

    generator.next(4); // --> передаём результат в генератор
}
//======================================================================================================================
{
    function* gen() {
        let ask1 = yield "2 + 2 = ?";

        alert(ask1); // 4

        let ask2 = yield "3 * 3 = ?"

        alert(ask2); // 9
    }

    let generator = gen();

    alert(generator.next().value); // "2 + 2 = ?"

    alert(generator.next(4).value); // "3 * 3 = ?"

    alert(generator.next(9).done); // true
}
//======================================================================================================================
{
    function* gen() {
        try {
            let result = yield "2 + 2 = ?"; // (1)

            alert("Выполнение программы не дойдёт до этой строки, потому что выше возникнет исключение");
        } catch (e) {
            alert(e); // покажет ошибку
        }
    }

    let generator = gen();

    let question = generator.next().value;

    generator.throw(new Error("Ответ не найден в моей базе данных")); // (2)
}
//======================================================================================================================
{
    function* generate() {
        let result = yield "2 + 2 = ?"; // Ошибка в этой строке
    }

    let generator = generate();

    let question = generator.next().value;

    try {
        generator.throw(new Error("Ответ не найден в моей базе данных"));
    } catch (e) {
        alert(e); // покажет ошибку
    }
}

//======================================================================================================================
{

}
//======================================================================================================================
