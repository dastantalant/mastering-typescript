function User(name) {
  // this = {};  (неявно)

  // добавляет свойства к this
  this.name = name;
  this.isAdmin = false;

  // return this;  (неявно)
}
let user = new User("Jack");
print(user.name); // Jack
print(user.isAdmin); // false
//======================================================================================================================
function User1() {
  print(new.target);
}
// без "new":
User1(); // undefined
// с "new":
new User1(); // function User { ... }
//======================================================================================================================
function User2(name) {
  if (!new.target) { // в случае, если вы вызвали меня без оператора new
    return new User2(name); // ...я добавлю new за вас
  }
  this.name = name;
}
let john = User2("John"); // переадресовывает вызов на new User
print(john.name); // John
//======================================================================================================================
function SmallUser() {
  this.name = "John";
  return; // <-- возвращает this
}
print( new SmallUser().name );  // John
//======================================================================================================================
function User3(name) {
  this.name = name;

  this.sayHi = function() {
    print( "Меня зовут: " + this.name );
  };
}

let john3 = new User("John");

john3.sayHi(); // Меня зовут: John

/*
john = {
   name: "John",
   sayHi: function() { ... }
}
*/
//======================================================================================================================