let a = (1 + 2, 3 + 4);
print( a ); // 7 (результат вычисления 3 + 4)

a = 1 + 2, 3 + 4;
print(a); // 3


print( 2 > 1 );  // true (верно)
print( 2 == 1 ); // false (неверно)
print( 2 != 1 ); // true (верно)

let result = 5 > 4; // результат сравнения присваивается переменной result
print( result ); // true

print( 'Я' > 'А' ); // true
print( 'Коты' > 'Кода' ); // true
print( 'Сонный' > 'Сон' ); // true


print( null === undefined ); // false
print( null == undefined ); // true

print( null > 0 );  // (1) false
print( null == 0 ); // (2) false
print( null >= 0 ); // (3) true

print( undefined > 0 ); // false (1)
print( undefined < 0 ); // false (2)
print( undefined == 0 ); // false (3)