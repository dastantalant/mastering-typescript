//======================================================================================================================
{
    class CoffeeMachine {
        _waterAmount = 0;

        set waterAmount(value) {
            if (value < 0) throw new Error("Отрицательное количество воды");
            this._waterAmount = value;
        }

        get waterAmount() {
            return this._waterAmount;
        }

        constructor(power) {
            this._power = power;
        }

    }

    // создаём новую кофеварку
    let coffeeMachine = new CoffeeMachine(100);

    // устанавливаем количество воды
    coffeeMachine.waterAmount = -10; // Error: Отрицательное количество воды
}
//======================================================================================================================
{
    class CoffeeMachine {
        // ...

        constructor(power) {
            this._power = power;
        }

        get power() {
            return this._power;
        }

    }

    // создаём кофеварку
    let coffeeMachine = new CoffeeMachine(100);

    alert(`Мощность: ${coffeeMachine.power}W`); // Мощность: 100W

    coffeeMachine.power = 25; // Error (no setter)
}
//======================================================================================================================
{
    class CoffeeMachine {
        #waterLimit = 200;

        #checkWater(value) {
            if (value < 0) throw new Error("Отрицательный уровень воды");
            if (value > this.#waterLimit) throw new Error("Слишком много воды");
        }
    }

    let coffeeMachine = new CoffeeMachine();

    // снаружи нет доступа к приватным методам класса
    coffeeMachine.#checkWater(); // Error
    coffeeMachine.#waterLimit = 1000; // Error
}
//======================================================================================================================
{
    class CoffeeMachine {

        #waterAmount = 0;

        get waterAmount() {
            return this.#waterAmount;
        }

        set waterAmount(value) {
            if (value < 0) throw new Error("Отрицательный уровень воды");
            this.#waterAmount = value;
        }
    }

    let machine = new CoffeeMachine();

    machine.waterAmount = 100;
    alert(machine.#waterAmount); // Error
}
//======================================================================================================================
