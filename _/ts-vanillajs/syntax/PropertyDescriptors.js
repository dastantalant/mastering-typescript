//======================================================================================================================
{
    let user = {
        name: "John"
    };

    let descriptor = Object.getOwnPropertyDescriptor(user, 'name');

    alert(JSON.stringify(descriptor, null, 2));
    /* дескриптор свойства:
    {
      "value": "John",
      "writable": true,
      "enumerable": true,
      "configurable": true
    }
    */
}
//======================================================================================================================
{
    let user = {};

    Object.defineProperty(user, "name", {
        value: "John"
    });

    let descriptor = Object.getOwnPropertyDescriptor(user, 'name');

    alert(JSON.stringify(descriptor, null, 2));
    /*
    {
      "value": "John",
      "writable": false,
      "enumerable": false,
      "configurable": false
    }
     */
}
//======================================================================================================================
{
    let user = {
        name: "John"
    };

    Object.defineProperty(user, "name", {
        writable: false
    });

    user.name = "Pete"; // Ошибка: Невозможно изменить доступное только для чтения свойство 'name'
}
//======================================================================================================================
{
    let user = {
        name: "John",
        toString() {
            return this.name;
        }
    };

    Object.defineProperty(user, "toString", {
        enumerable: false
    });

    // Теперь наше свойство toString пропало из цикла:
    for (let key in user) alert(key); // name
}
//======================================================================================================================
{
    let descriptor = Object.getOwnPropertyDescriptor(Math, 'PI');

alert( JSON.stringify(descriptor, null, 2 ) );
/*
{
  "value": 3.141592653589793,
  "writable": false,
  "enumerable": false,
  "configurable": false
}
*/
}
//======================================================================================================================
{
    let user = {
  name: "John"
};

Object.defineProperty(user, "name", {
  configurable: false
});

user.name = "Pete"; // работает
delete user.name; // Ошибка
}
//======================================================================================================================
{
    let user = {
  name: "John"
};

Object.defineProperty(user, "name", {
  writable: false,
  configurable: false
});

// теперь невозможно изменить user.name или его флаги
// всё это не будет работать:
user.name = "Pete";
delete user.name;
Object.defineProperty(user, "name", { value: "Pete" });
}
//======================================================================================================================
