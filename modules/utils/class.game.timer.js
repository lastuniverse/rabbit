/**
 * Класс Phaser-о зависимого таймера. Для своей работы использует время фазера, а конкретно `phaser.time.elapsedMS`.
 * При этом, свой внутренний таймер обновляет по игровому событию update. Таким образом, если игра находится на паузе
 * таймер так же встанет на паузу. 
 * Второй особенностью таймера является возможность управления скоростью течения времени. Это достигается за счет того, 
 * что при обновлении внутреннего таймера величина `phaser.time.elapsedMS` умножается на коэффициент скорости (по умолчанию равен 1)
 */
 class GameTimer{
    /**
     * @constructor
     */     
    constructor() {
        // тут будем хранить установленные обработчики
        this.timers = {};

        this.index = 0;

        // скорость времени
        this.multiplier = 1;
        this.divider = 1/this.multiplier;


        // инициализация
        this.timer = 0;
        this.oldTime = 0;
    }

    /**
     * устанавливает скорость течения времени таймеров, включая действующие(запущенные) таймеры.
     * @param {number} speed коэффициент скорости течения времени
     */
    setSpeed(speed){
        if(typeof speed !== 'number') return
        this.multiplier = speed;
        this.divider = 1/this.multiplier;
    }

    /**
     * слушатель игрового события `update` (необходимо вызывать вручную)
     * 
     */
     update(delta) {
        if(this.timerProcess) return;
        this.timerProcess = true;

        this.timer += delta*this.multiplier;;

        Object.values(this.timers).forEach(function (item) {
            if (item.time > this.timer) return;
            delete this.timers[item.index];
            if (typeof item.callback === 'function') {
                item.callback.call(item.context || null);
            }
        }, this);
        this.timerProcess = false;
        
        
    }

    /**
     * Функция обратного вызова, передаваемая в метод {@link GameTimer#setTimer GameTimer.setTimer(...)} будет вызвана по истечении
     * таймаута по времени Phaser-а.
     * @callback GameTimer~FuncCallback
     */


    /**
     * Работа метода почти идентична работе функции setTimeout(...). Разница заключается
     * лишь в том, что в качестве таймера используется PIXI.ticker, а так же тем, что 
     * таймер последним аргументом может принимать контекст вызова callback функции
     * @param {GameTimer~FuncCallback} callback функция обратного вызоа. Будет вызвана по истечении
     * таймаута по времени Phaser-а.
     * @param {number} time Время задержки в милисекундах.
     * @param {object} context Контекст, в котором будет вызвана функция обратного вызоа.
     * 
     * @returns {GameTimer} ссылка на самого себя.
     */
    setTimer(callback, time, context) {
        if (typeof callback !== 'function') return this;
        if (typeof time !== 'number') return this;
        if (!context) context = null;
        
        this.index++;
        this.timers[this.index] = {
            index: this.index,
            time: this.timer + time,
            callback: callback,
            context: context,
        };

        return this;
    }
    /**
     * Удаляет ранее установленный таймер(ы). Если в нескольких таймерах в качестве
     * callback была установленна одна и таже функция, то все эти таймеры будут удалены
     * @param {function} callback установленная для таймера функция обработчик
     * @returns {number} возвращает количество удаленных таймеров
     */
    removeTimer(callback) {
        if (typeof callback !== 'function') return this;

        let count = 0;

        Object.values(this.timers).forEach(function (item) {
            if(item.callback!==callback) return;
            delete this.timers[item.index];
            count++;
        }, this);

        return count;
    }

}


export default GameTimer;