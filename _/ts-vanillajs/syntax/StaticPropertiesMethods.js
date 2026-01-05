//======================================================================================================================
{
    class User {
        static staticMethod() {
            alert(this === User);
        }
    }

    User.staticMethod(); // true

}
//======================================================================================================================
{
    class User { }

    User.staticMethod = function () {
        alert(this === User);
    };
}
//======================================================================================================================
{
    class Article {
        constructor(title, date) {
            this.title = title;
            this.date = date;
        }

        static compare(articleA, articleB) {
            return articleA.date - articleB.date;
        }
    }

    // использование
    let articles = [
        new Article("HTML", new Date(2019, 1, 1)),
        new Article("CSS", new Date(2019, 0, 1)),
        new Article("JavaScript", new Date(2019, 11, 1))
    ];

    articles.sort(Article.compare);

    alert(articles[0].title); // CSS
}
//======================================================================================================================
{
    class Article {
        constructor(title, date) {
            this.title = title;
            this.date = date;
        }

        static createTodays() {
            // помним, что this = Article
            return new this("Сегодняшний дайджест", new Date());
        }
    }

    let article = Article.createTodays();

    alert(article.title); // Сегодняшний дайджест
}
//======================================================================================================================
{
    class Animal {

  constructor(name, speed) {
    this.speed = speed;
    this.name = name;
  }

  run(speed = 0) {
    this.speed += speed;
    alert(`${this.name} бежит со скоростью ${this.speed}.`);
  }

  static compare(animalA, animalB) {
    return animalA.speed - animalB.speed;
  }

}

// Наследует от Animal
class Rabbit extends Animal {
  hide() {
    alert(`${this.name} прячется!`);
  }
}

let rabbits = [
  new Rabbit("Белый кролик", 10),
  new Rabbit("Чёрный кролик", 5)
];

rabbits.sort(Rabbit.compare);

rabbits[0].run(); // Чёрный кролик бежит со скоростью 5.
}
//======================================================================================================================
