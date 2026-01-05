//======================================================================================================================
{
    function curry(f) { // curry(f) выполняет каррирование
        return function (a) {
            return function (b) {
                return f(a, b);
            };
        };
    }

    // использование
    function sum(a, b) {
        return a + b;
    }

    let curriedSum = curry(sum);

    alert(curriedSum(1)(2)); // 3
}
//======================================================================================================================
{
    function sum(a, b) {
        return a + b;
    }

    let curriedSum = _.curry(sum); // используем _.curry из lodash

    alert(curriedSum(1, 2)); // 3, можно вызывать как обычно
    alert(curriedSum(1)(2)); // 3, а можно частично
}
//======================================================================================================================
{
    function curry(func) {

        return function curried(...args) {
            if (args.length >= func.length) {
                return func.apply(this, args);
            } else {
                return function (...args2) {
                    return curried.apply(this, args.concat(args2));
                }
            }
        };

    }
    function sum(a, b, c) {
        return a + b + c;
    }

    let curriedSum = curry(sum);

    alert(curriedSum(1, 2, 3)); // 6, всё ещё можно вызывать нормально
    alert(curriedSum(1)(2, 3)); // 6, каррирование первого аргумента
    alert(curriedSum(1)(2)(3)); // 6, каррирование всех аргументов
}
//======================================================================================================================
{
    // func -- функция, которую мы трансформируем
    function curried(...args) {
        if (args.length >= func.length) { // (1)
            return func.apply(this, args);
        } else {
            return function pass(...args2) { // (2)
                return curried.apply(this, args.concat(args2));
            }
        }
    };
}
