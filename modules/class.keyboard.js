class Keyboard {
    constructor() {
        // тут будут флаги отслеживания нажатия кнопок
        this.keys = {};

        // тут запомним текущие обработчики кнопок
        this.listeners = {};

        // устанавливаем слушатели на нажатия, удержание и отжатия кнопок
        window.addEventListener("keydown", this.downListener.bind(this),false);
        window.addEventListener("keyup", this.upListener.bind(this),false);
    }

    setListeners(list, context) {
        if (!list || typeof list !== 'object') return;
        if (!context) context = null;
        this.listeners = {};
        Object.keys(list).forEach(function (key) {
            if (typeof list[key] !== 'function') return;
            this.listeners[key] = function (key) {
                list[key].call(context, key);
            };
        }, this)
    }

    downListener(event) {
        const key = event.code.replace(/^(Key|Digit)/i, '').toUpperCase();
        if (this.keys[key]) return;
        this.keys[key] = true;

        if (this.listeners[key])
            this.listeners[key](key);
        // console.log('onDown', key);
    }
    upListener(event) {
        const key = event.code.replace(/^(Key|Digit)/i, '').toUpperCase();
        this.keys[key] = false;

        // console.log('onUp',key);
        // this.emit(key, 'up');
    }
    pressListener(key) {
        // key = key.toUpperCase();
        // console.log('onPress',key);
        // this.emit(key, 'press');

    }

    /**
     * Функция обратного вызова, передаваемая в метод {@link GameKeyboard#setTimer GameKeyboard.setTimer(...)} будет вызвана по истечении
     * таймаута по времени Phaser-а.
     * @callback GameKeyboard~FuncCallback
     */



}

export default Keyboard;