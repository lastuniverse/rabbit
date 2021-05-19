// модуль имитирует ассинхронную заглузку данных


// сами данные
let data = {
    userdata: {
        name: 'Guest_1234',
        score: 0,
        money: 0,
        distance: 0
    },
    leadboard: {
        alltime: [
            {name: 'Вася Пупкин', score: 99999 },
            {name: 'Петя машечкин', score: 88888 },
            {name: 'Павлик Морозов', score: 77777 },
            {name: 'Костя Беc', score: 66666 },
            {name: 'Черная Баронесса', score: 55555 },
            {name: 'Владимир Владимирович', score:44444 },
            {name: 'Лунтик', score: 33333 },
            {name: 'Медвед', score: 22222 },
            {name: '123', score: 11111 },
            {name: 'test', score: 0 },
        ],
        month: [
        ],
        week: [
        ],
    }
}


// загружаем данные из локалсторадж
const temp = localStorage.getItem('userdata');
if(temp) data = JSON.parse(temp);
localStorage.setItem('userdata', JSON.stringify(data) );


// некая абстракция, имитирующая API сервера
const API = {
    'https://lastuniverse.ru/pixi.js/api/leadboard': {
        'GET': function( options){
            const list = data.leadboard[options.interval]||[];
            return list;
        }
    },
    'https://lastuniverse.ru/pixi.js/api/user': {
        'GET': function( options){
            return data.userdata;
        },
        'POST': function( options){
            // обновляем данные пользователя
            data.userdata = {
                ...data.userdata,
                ...options
            };
            // сохраняем данные в локалсторадж
            localStorage.setItem('userdata', JSON.stringify(data) );
            return {success: true};
        }
    }, 
}

// некая абстракция, имитирующая загрузку данных по сети
export function fakeAjax(url, method, options, callback){
    if(!API?.[url]?.[method]){
        setTimeout(() => {
            callback({error: 404});
        }, Math.random()*1000);
    }else{
        setTimeout(() => {
            const result = API[url][method](options);
            callback(result);                
        }, Math.random()*1000);
    
    }
}

