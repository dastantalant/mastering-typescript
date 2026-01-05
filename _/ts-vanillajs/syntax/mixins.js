//======================================================================================================================
{
    // примесь
    let sayHiMixin = {
        sayHi() {
            alert(`Привет, ${this.name}`);
        },
        sayBye() {
            alert(`Пока, ${this.name}`);
        }
    };

    // использование:
    class User {
        constructor(name) {
            this.name = name;
        }
    }

    // копируем методы
    Object.assign(User.prototype, sayHiMixin);

    // теперь User может сказать Привет
    new User("Вася").sayHi(); // Привет, Вася!
}
//======================================================================================================================
{
    let sayMixin = {
        say(phrase) {
            alert(phrase);
        }
    };

    let sayHiMixin = {
        __proto__: sayMixin, // (или мы можем использовать Object.setPrototypeOf для задания прототипа)

        sayHi() {
            // вызываем метод родителя
            super.say(`Привет, ${this.name}`); // (*)
        },
        sayBye() {
            super.say(`Пока, ${this.name}`); // (*)
        }
    };

    class User {
        constructor(name) {
            this.name = name;
        }
    }

    // копируем методы
    Object.assign(User.prototype, sayHiMixin);

    // теперь User может сказать Привет
    new User("Вася").sayHi(); // Привет, Вася!
}
//======================================================================================================================
{
    let eventMixin = {
        /**
         * Подписаться на событие, использование:
         * menu.on('select', function(item) { ... }
         */
        on(eventName, handler) {
            if (!this._eventHandlers) this._eventHandlers = {};
            if (!this._eventHandlers[eventName]) {
                this._eventHandlers[eventName] = [];
            }
            this._eventHandlers[eventName].push(handler);
        },

        /**
         * Отменить подписку, использование:
         * menu.off('select', handler)
         */
        off(eventName, handler) {
            let handlers = this._eventHandlers?.[eventName];
            if (!handlers) return;
            for (let i = 0; i < handlers.length; i++) {
                if (handlers[i] === handler) {
                    handlers.splice(i--, 1);
                }
            }
        },

        /**
         * Сгенерировать событие с указанным именем и данными
         * this.trigger('select', data1, data2);
         */
        trigger(eventName, ...args) {
            if (!this._eventHandlers?.[eventName]) {
                return; // обработчиков для этого события нет
            }

            // вызовем обработчики
            this._eventHandlers[eventName].forEach(handler => handler.apply(this, args));
        }
    };
}
//======================================================================================================================
{
    // Создадим класс
    class Menu {
        choose(value) {
            this.trigger("select", value);
        }
    }
    // Добавим примесь с методами для событий
    Object.assign(Menu.prototype, eventMixin);

    let menu = new Menu();

    // Добавим обработчик, который будет вызван при событии "select":
    menu.on("select", value => alert(`Выбранное значение: ${value}`));

    // Генерирует событие => обработчик выше запускается и выводит:
    menu.choose("123"); // Выбранное значение: 123
}
//======================================================================================================================
