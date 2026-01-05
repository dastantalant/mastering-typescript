//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        // for..of вызывает этот метод один раз в самом начале
        [Symbol.iterator]() {
            // ...возвращает объект-итератор:
            // далее for..of работает только с этим объектом, запрашивая следующее значение вызовом next()
            return {
                current: this.from,
                last: this.to,

                // next() вызывается на каждой итерации цикла for..of
                next() { // (2)
                    // должен возвращать значение в виде объекта {done:.., value :...}
                    if (this.current <= this.last) {
                        return { done: false, value: this.current++ };
                    } else {
                        return { done: true };
                    }
                }
            };
        }
    };

    for (let value of range) {
        alert(value); // 1, потом 2, потом 3, потом 4, потом 5
    }
}
//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        // for await..of вызывает этот метод один раз в самом начале
        [Symbol.asyncIterator]() { // (1)
            // ...возвращает объект-итератор:
            // далее for await..of работает только с этим объектом,
            // запрашивая у него следующие значения вызовом next()
            return {
                current: this.from,
                last: this.to,

                // next() вызывается на каждой итерации цикла for await..of
                async next() { // (2)
                    // должен возвращать значение как объект {done:.., value :...}
                    // (автоматически оборачивается в промис с помощью async)

                    // можно использовать await внутри для асинхронности:
                    await new Promise(resolve => setTimeout(resolve, 1000)); // (3)

                    if (this.current <= this.last) {
                        return { done: false, value: this.current++ };
                    } else {
                        return { done: true };
                    }
                }
            };
        }
    };

    (async () => {

        for await (let value of range) { // (4)
            alert(value); // 1,2,3,4,5
        }

    })()
}
//======================================================================================================================
{
    function* generateSequence(start, end) {
        for (let i = start; i <= end; i++) {
            yield i;
        }
    }

    for (let value of generateSequence(1, 5)) {
        alert(value); // 1, потом 2, потом 3, потом 4, потом 5
    }
}
//======================================================================================================================
{
    async function* generateSequence(start, end) {

        for (let i = start; i <= end; i++) {

            // ура, можно использовать await!
            await new Promise(resolve => setTimeout(resolve, 1000));

            yield i;
        }

    }

    (async () => {

        let generator = generateSequence(1, 5);
        for await (let value of generator) {
            alert(value); // 1, потом 2, потом 3, потом 4, потом 5
        }

    })();
}
//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        *[Symbol.iterator]() { // сокращение для [Symbol.iterator]: function*()
            for (let value = this.from; value <= this.to; value++) {
                yield value;
            }
        }
    };

    for (let value of range) {
        alert(value); // 1, потом 2, потом 3, потом 4, потом 5
    }
}
//======================================================================================================================
{
    let range = {
        from: 1,
        to: 5,

        async *[Symbol.asyncIterator]() { // то же, что и [Symbol.asyncIterator]: async function*()
            for (let value = this.from; value <= this.to; value++) {

                // пауза между значениями, ожидание
                await new Promise(resolve => setTimeout(resolve, 1000));

                yield value;
            }
        }
    };

    (async () => {

        for await (let value of range) {
            alert(value); // 1, потом 2, потом 3, потом 4, потом 5
        }

    })();
}
//======================================================================================================================
{
    async function* fetchCommits(repo) {
        let url = `https://api.github.com/repos/${repo}/commits`;

        while (url) {
            const response = await fetch(url, { // (1)
                headers: { 'User-Agent': 'Our script' }, // GitHub требует заголовок user-agent
            });

            const body = await response.json(); // (2) ответ в формате JSON (массив коммитов)

            // (3) Ссылка на следующую страницу находится в заголовках, извлекаем её
            let nextPage = response.headers.get('Link').match(/<(.*?)>; rel="next"/);
            nextPage = nextPage && nextPage[1];

            url = nextPage;

            for (let commit of body) { // (4) вернуть коммиты один за другим, до окончания страницы
                yield commit;
            }
        }
    }
}
//======================================================================================================================
{
    async function* fetchCommits(repo) {
        let url = `https://api.github.com/repos/${repo}/commits`;

        while (url) {
            const response = await fetch(url, { // (1)
                headers: { 'User-Agent': 'Our script' }, // GitHub требует заголовок user-agent
            });

            const body = await response.json(); // (2) ответ в формате JSON (массив коммитов)

            // (3) Ссылка на следующую страницу находится в заголовках, извлекаем её
            let nextPage = response.headers.get('Link').match(/<(.*?)>; rel="next"/);
            nextPage = nextPage && nextPage[1];

            url = nextPage;

            for (let commit of body) { // (4) вернуть коммиты один за другим, до окончания страницы
                yield commit;
            }
        }
    }
    (async () => {

        let count = 0;

        for await (const commit of fetchCommits('javascript-tutorial/en.javascript.info')) {

            console.log(commit.author.login);

            if (++count == 100) { // остановимся на 100 коммитах
                break;
            }
        }

    })();
}
