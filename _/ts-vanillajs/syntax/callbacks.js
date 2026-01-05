//======================================================================================================================
{
    function loadScript(src) {
        let script = document.createElement('script');
        script.src = src;
        document.head.append(script);
    }
}
//======================================================================================================================
{
    function loadScript(src, callback) {
        let script = document.createElement('script');
        script.src = src;
        script.onload = () => callback(script);
        document.head.append(script);
    }
}
//======================================================================================================================
{
    loadScript('/my/script.js', function (script) {

        alert(`Здорово, скрипт ${script.src} загрузился, загрузим ещё один`);

        loadScript('/my/script2.js', function (script) {
            alert(`Здорово, второй скрипт загрузился`);
        });

    });
}
//======================================================================================================================
{
    function loadScript(src, callback) {
        let script = document.createElement('script');
        script.src = src;

        script.onload = () => callback(null, script);
        script.onerror = () => callback(new Error(`Не удалось загрузить скрипт ${src}`));

        document.head.append(script);
    }
}
//======================================================================================================================
{
    loadScript('1.js', step1);

    function step1(error, script) {
        if (error) {
            handleError(error);
        } else {
            // ...
            loadScript('2.js', step2);
        }
    }

    function step2(error, script) {
        if (error) {
            handleError(error);
        } else {
            // ...
            loadScript('3.js', step3);
        }
    }

    function step3(error, script) {
        if (error) {
            handleError(error);
        } else {
            // ...и так далее, пока все скрипты не будут загружены (*)
        }
    };
}
//======================================================================================================================
