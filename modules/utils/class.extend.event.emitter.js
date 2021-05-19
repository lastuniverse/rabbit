/**
 * класс ExtendEventEmitter - упрощенный вариант EventEmitter-а из NodeJs но имеющий 
 * при этом существенное дополнение - в именах событий поддерживаются простые шаблоны,
 * что позволяет более гибко устанавливать обработчики событий, и вызывать их.
 * Пример ниже дает представление о возможностях использования данных шаблонов:
 * ```
 *  'aaa'       === 'aaa'
 *  'aaa'       !== 'bbb'
 *  'aaa.bbb'   === 'aaa.bbb'
 *  'aaa.bbb'   !== 'aaa.ccc'
 *  'aaa.*'     === 'aaa'
 *  'aaa.*'     === 'aaa.*'
 *  'aaa.*'     === 'aaa.bbb'
 *  'aaa.*.ccc' !== 'aaa'
 *  'aaa.*.ccc' === 'aaa.*'
 *  'aaa.*.ccc' !== 'aaa.bbb'
 *  'aaa.*.*'   === 'aaa.bbb'
 *  'aaa.*.ccc' === 'aaa.bbb.*'
 *  'aaa.*.ccc' === 'aaa.bbb.ccc'
 *  '*'         === 'aaa'
 *  '*'         === 'aaa.bbb'
 *  '*'         === 'aaa.bbb.ccc'
 * ```
 */
class ExtendEventEmitter {
    /**
     * This callback is displayed as part of the MyClass class.
     * @callback ExtendEventEmitter~FuncCallback
     * @param {any} arguments любые аргументы (функция примет те аргументы, которые были переданы методу {@link ExtendEventEmitter#emit ExtendEventEmitter.emit()} начиная со второго параметра)
     */

    /**
     * @constructor
     * @param {boolean} isAsync - принимет значения true и false. По умолчанию false
     */
    constructor(isAsync) {
        // Классический метод защиты от конструкторов, не вызываемых с помощью new
        if (!(this instanceof ExtendEventEmitter)) {
            return new ExtendEventEmitter(isAsync);
        }
        this.__isAsync = isAsync;
        this.__e = {};
        this.splitter = '.'
    }

    /**
     * Производит поиск обработчиков с соответсвующим шаблоном пути.
     * Принцип сравнения шаблонов раскрывает следующий пример
     * ```
     *  'aaa'       === 'aaa'
     *  'aaa'       !== 'bbb'
     *  'aaa.bbb'   === 'aaa.bbb'
     *  'aaa.bbb'   !== 'aaa.ccc'
     *  'aaa.*'     === 'aaa'
     *  'aaa.*'     === 'aaa.*'
     *  'aaa.*'     === 'aaa.bbb'
     *  'aaa.*.ccc' !== 'aaa'
     *  'aaa.*.ccc' === 'aaa.*'
     *  'aaa.*.ccc' !== 'aaa.bbb'
     *  'aaa.*.*'   === 'aaa.bbb'
     *  'aaa.*.ccc' === 'aaa.bbb.*'
     *  'aaa.*.ccc' === 'aaa.bbb.ccc'
     *  '*'         === 'aaa'
     *  '*'         === 'aaa.bbb'
     *  '*'         === 'aaa.bbb.ccc'
     * ```
     * @param {string} eventName 
     * @returns {array} список обработчиков событий, положительно прошедших проверку
     */
    getListeners(eventName){
        const path1 = eventName.split('.');
        const len1 = path1.length;

        const list = Object.values(this.__e).reduce((acc,item)=>{
            const path2 = item.path;
            const len2 = path2.length;
            const len = Math.max(len1, len2);

            let isEqual = true;
        
            for(let i=0; i<len; i++){
                const key1 = path1[i];
                const key2 = path2[i];
                if(key1==='*' && len1===i+1 ) break;
                if(key2==='*' && len2===i+1 ) break;
                if(key1==='*' || key2==='*' || key1===key2) continue;
                isEqual = false;
                break;
            }
            
            if( isEqual ){
                acc.push(...item.listeners);
            }
            return acc;
        },[]);
        return list;
    }
    /** @lends ExtendEventEmitter.prototype */
    /**
     * Устанавливает постоянный обработчик `listener` события `eventName`
     * @param  {String}   eventName    название события
     * @param  {ExtendEventEmitter~FuncCallback} listener обработчик события
     * @param  {object} context контекст, в котором будет вызван обработчик события
     * 
     * @returns {Function} установленный обработчик события
     */
    on(eventName, listener, context) {
        if (typeof listener !== 'function') return;
        if (!context) context = null;

        if (typeof this.__e[eventName] !== 'object') {
            this.__e[eventName] = {
                path: eventName.split(this.splitter),
                listeners: [],
            };
        }
        this.__e[eventName].listeners.push({ listener: listener, context: context });
        return listener;
    }
    /**
     * Удаляет обработчик listener события eventName
     *
     * @param  {String}   eventName    название события
     * @param  {Function} listener обработчик события
     */
    removeListener(eventName, listener) {
        // const list = this.__e[eventName]?.listeners;
        const list = this.getListeners(eventName);

        if (!Array.isArray(list))
            return;

        const idx = list.findIndex(function (item) {
            return listener === item.listener;
        }, this);

        if (idx < 0)
            return;

        list.splice(idx, 1);

        if (!list.length)
            delete this.__e[eventName];
    }
    /**
     * Создает событие event вызывая все зарегестрированные для него обработчики
     *
     * @param  {String}   eventName    название события
     * @param  {any} arguments  аргументы для обработчиков событий
     */
    emit(eventName, ...args) {
        // console.log('EVENT',eventName,args)
        // const list = this.__e[eventName]?.listeners;
        const list = this.getListeners(eventName);


        if (!Array.isArray(list))
            return;
        if (this.__isAsync) {
            list.slice(0).forEach(function (item) {
                setImmediate(function () {
                    item.listener.apply(item.context, args);
                });
            });
        } else {
            list.slice(0).forEach(function (item) {
                // if(eventName!=='game.update') console.log(eventName, "args",...args);
                item.listener.apply(item.context, args);
            });
        }
    }
    /**
     * Устанавливает одноразовый обработчик listener события eventName
     *
     * @param  {String}   eventName    название события
     * @param  {ExtendEventEmitter~FuncCallback} listener обработчик события
     * @param  {object} context контекст, в котором будет вызван обработчик события
     * 
     * @returns {Function} установленный обработчик события
     */
    once(eventName, listener, context) {

        if (!context) context = null;
        const _self = this;
        const g = (...args) => {
            // console.log('removeListener', 1, eventName, (Array.isArray(_self.__e[eventName])?_self.__e[eventName].length:0))
            this.removeListener(eventName, g);
            listener.apply(context, args);
            // console.log('removeListener', 2, eventName, (Array.isArray(_self.__e[eventName])?_self.__e[eventName].length:0))
        };
        this.on(eventName, g);
        return listener;
    }
}

window.ExtendEventEmitter = ExtendEventEmitter;





// /**
//  * Тестовое событие
//  *
//  * @event ExtendEventEmitter#test
//  * @type {object}
//  * @property {object} test - просто параметр
//  * @property {boolean} test.isTest - просто параметр
//  * @param {object} test - просто параметр
//  * @param {boolean} test.isTest - просто параметр
//  * @param {string} test.test - просто параметр
//  */


export default ExtendEventEmitter;




// function getListeners(eventName1, eventName2){
//     const path1 = eventName1.split('.');
//     const path2 = eventName2.split('.');
//     const len1 = path1.length;
//     const len2 = path2.length;
//     const len = Math.max(len1, len2);
//     let isEqual = true;

//     for(let i=0; i<len; i++){
//         const key1 = path1[i];
//         const key2 = path2[i];
//         if(key1==='*' && len1===i+1 ) break;
//         if(key2==='*' && len2===i+1 ) break;
//         if(key1==='*' || key2==='*' || key1===key2) continue;
//         isEqual = false;
//         break;
//     }
    
//     if( isEqual ){
//         console.log(eventName1, "===", eventName2)
//     }else{
//         console.log(eventName1, "!==",eventName2)
//     }

// };


// getListeners('aaa', 'aaa');
// getListeners('aaa', 'bbb');
// getListeners('aaa.bbb', 'aaa.bbb')
// getListeners('aaa.bbb', 'aaa.ccc')
// getListeners('aaa.*', 'aaa')
// getListeners('aaa.*', 'aaa.*')
// getListeners('aaa.*', 'aaa.bbb')
// getListeners('aaa.*.ccc', 'aaa')
// getListeners('aaa.*.ccc', 'aaa.*')
// getListeners('aaa.*.ccc', 'aaa.bbb')
// getListeners('aaa.*.*', 'aaa.bbb')
// getListeners('aaa.*.ccc', 'aaa.bbb.*')
// getListeners('aaa.*.ccc', 'aaa.bbb.ccc')
// getListeners('*', 'aaa')
// getListeners('*', 'aaa.bbb')
// getListeners('*', 'aaa.bbb.ccc')
















