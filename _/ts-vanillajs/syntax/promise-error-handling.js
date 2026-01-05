//======================================================================================================================
{
    fetch('https://no-such-server.blabla') // ошибка
        .then(response => response.json())
        .catch(err => alert(err)) // TypeError: failed to fetch (текст может отличаться)
}
//======================================================================================================================
{
    fetch('/article/promise-chaining/user.json')
        .then(response => response.json())
        .then(user => fetch(`https://api.github.com/users/${user.name}`))
        .then(response => response.json())
        .then(githubUser => new Promise((resolve, reject) => {
            let img = document.createElement('img');
            img.src = githubUser.avatar_url;
            img.className = "promise-avatar-example";
            document.body.append(img);

            setTimeout(() => {
                img.remove();
                resolve(githubUser);
            }, 3000);
        }))
        .catch(error => alert(error.message));
}
//======================================================================================================================
{
    // the execution: catch -> then
    new Promise((resolve, reject) => {

        throw new Error("Ошибка!");

    }).catch(function (error) {

        alert("Ошибка обработана, продолжить работу");

    }).then(() => alert("Управление перейдёт в следующий then"));
}
//======================================================================================================================
{
    // the execution: catch -> catch -> then
    new Promise((resolve, reject) => {

        throw new Error("Ошибка!");

    }).catch(function (error) { // (*)

        if (error instanceof URIError) {
            // обрабатываем ошибку
        } else {
            alert("Не могу обработать ошибку");

            throw error; // пробрасывает эту или другую ошибку в следующий catch
        }

    }).then(function () {
        /* не выполнится */
    }).catch(error => { // (**)

        alert(`Неизвестная ошибка: ${error}`);
        // ничего не возвращаем => выполнение продолжается в нормальном режиме

    });
}
//======================================================================================================================
