import AnimationsManager from './class.animations.manager.js'

/**
 * Объекты класса AnimationsWrapper предназначены для обертывания произвольных объектов и предоставляют
 * интерфейс управления группами именованных анимаций. Хранят в себе наборы объектов, копии параметров 
 * пресетов(миксов) анимации и данные о текущем прогрессе анимации.
 */
class AnimationsWrapper {
    /**
     * @constructor
     * @param {Array<object>} targetObject целевой(управляемый) объект или массив таких объектов
     * @param {object} animationsManager объект класса animationsManager содержащий в себе настроенные именованные группы анимаций
     */
    constructor(targetObject, animationsManager) {
        // небольшой хак, чтобы не заставлять requre грузить циклические зависимости
        // if (typeof animationsManager !== 'object' || animationsManager.constructor.name !== 'AnimationsManager') {
        if (!(animationsManager instanceof AnimationsManager)) {
            throw 'animationsManager должен быть объектом класса AnimationsManager';
        }

        this.processed = [];
        this.targets = [];

        this.manager = animationsManager;
        this.addTargets(targetObject);
        this.manager.addTargets(this);
    }
    /**
     * Добавить целевой объект
     * @param {Array<object>} targetObject целевой(управляемый) объект или массив таких объектов
     * @return {AnimationsWrapper} возращает указатель на самого себя
     */
    addTargets(targetObject) {
        if (typeof targetObject !== 'object') {
            throw 'targetObject должен быть объектом или массивом объектов';
        }

        if (targetObject instanceof AnimationsWrapper) {
            targetObject = targetObject.targets;
        }
        if (!Array.isArray(targetObject))
            targetObject = [targetObject];

        targetObject.forEach(function (object) {
            if (typeof object !== 'object')
                return;

            if (object instanceof AnimationsWrapper)
                return this.addTargets(object);

            const isExists = this.targets.some(function (existsObject) {
                return object === existsObject;
            }, this);

            if (isExists)
                return;

            this.targets.push(object);

        }, this);

        return this;
    }
    /**
     * Удалит целевой объект
     * @param {object} targetObject целевой(управляемый) объект
     * @return {AnimationsWrapper} возращает указатель на самого себя
     */
    removeTargets(targetObject) {
        if (typeof targetObject !== 'object') {
            throw 'targetObject должен быть объектом или массивом объектов';
        }
        this.targets = this.targets.filter(function (object) {
            return (object !== targetObject);
        }, this);
        return this;
    }
    /**
     * Удалить AnimationsWrapper
     */
    destroy() {
        this.isDestroy = true;
        this.targets = [];
        this.processed = [];
        this.manager.removeTargets(this);
    }
    /**
     * Проигрывает на целевых объектах указанный набор анимаций
     * @param  {String}   presetName    название набора анимаций
     * @param {object} options объект с доп параметрами, передаваемыми четвертым аргументом
     * в аниматоры, объявленные в конфиге компонента. если объект задан то options
     * в аниматорах будет обновлен.
     * @param {boolean} isStop если true то принудительно останавливает уже играющие анимации.
     * @return {AnimationsWrapper} возращает указатель на самого себя
     * 
     */
    play(presetName, options, isStop) {
        // console.log('->>>', presetName, options);
        if(true === isStop) this.stop();
        let params;
        const isPlayed = this.processed.some(function (item) {
            if (presetName === item.presetName && item.isPlayed)
                return true;
            if (presetName === item.presetName) {
                params = item;
            }

            return false;

        }, this);

        if (isPlayed)
            return;

        const isExists = !!params;


        if (isExists) {
            if(options && typeof options === 'object' && !Array.isArray(options))
                params.options=options;

            params.isPlayed = true;

            params.animations.forEach(function (animation) {
                animation.isPlayed = true;
            }, this);

            this.manager.addProcessed(this);
            // this.emitEvent((isExists ? 'continue' : 'start'), params);
        } else if (presetName && this.manager.presets[presetName]) {
            if(!options || typeof options !== 'object')
                options = {};

            if (!this.manager.presets[presetName])
                return;
            params = {
                presetName: presetName,
                isPlayed: true,
                startedTime: this.manager.timer,
                playedTime: 0,
                options: options,
                animations: this.manager.presets[presetName]
                    .filter(animation => {
                        if (!animation.time)
                            return false;
                        if (!animation.name)
                            return false;
                        return true;
                    })
                    .map(function (animation) {
                        return {
                            loop: 1,
                            delay: 0,
                            // loopDelay: 0,
                            ...animation,
                            isPlayed: true
                        }; /*EC6*/
                    }, this)
            };
            this.processed.push(params);
            this.manager.addProcessed(this);
            // this.emitEvent((isExists ? 'continue' : 'start'), params);
        } else {
            Object.keys(this.manager.presets).forEach(function (key) {
                this.play(key, options);
            }, this);
        }


        return this;
    }
    /**
     * Приостанавливает воспроизведение указанного набора анимаций
     * @param  {String}   presetName    название набора анимаций
     * @return {AnimationsWrapper} возращает указатель на самого себя
     */
    pause(presetName) {
        this.processed.forEach(function (item) {
            if (!presetName || item.presetName === presetName) {
                if (!item.isPlayed)
                    return;

                item.isPlayed = false;
                item.pausedTime = this.manager.timer; //Date.now();
                item.animations.forEach(function (animation) {
                    animation.isPlayed = false;
                }, this);
                // this.emitEvent('pause', item);
            }
        }, this);
        if (!this.processed.length)
            this.manager.removeProcessed(this);
        return this;
    }
    /**
     * Возобнавляет воспроизведение указанного набора анимаций
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsWrapper} возращает указатель на самого себя
     */
    resume(presetName) {
        let params;
        const isPlayed = this.processed.some(function (item) {
            if (presetName === item.presetName && item.isPlayed)
                return true;
            if (presetName === item.presetName) {
                params = item;
            }
            return false;
        }, this);

        if (isPlayed)
            return;

        const isExists = !!params;

        if (isExists) {

            params.isPlayed = true;

            params.animations.forEach(function (animation) {
                animation.isPlayed = true;
            }, this);

            this.manager.addProcessed(this);
            // this.emitEvent((isExists ? 'continue' : 'start'), params);
        }
        return this;
    }
    /**
     * Останавливает воспроизведение указанного набора анимаций
     * @param  {String}   presetName    название набора анимаций
     * @return {AnimationsWrapper} возращает указатель на самого себя
     */
    stop(presetName) {
        this.processed = this.processed.filter(function (item) {
            if (!presetName || item.presetName === presetName) {
                // this.emitEvent('stop', item);
                return false;
            }

            return true;
        }, this);
        if (!this.processed.length)
            this.manager.removeProcessed(this);
        return this;
    }
    /**
     * производит расчет указанных анимаций
     */
    update() {
        if (this.isDestroy) {
            this.manager.removeTargets(this);
            return;
        }

        // console.log(this.manager.scene.time);
        this.processed.forEach(function (item) {
            if (!item.isPlayed)
                return;

            const list = item.animations.map(animation => {
                if (!animation.isPlayed)
                    return false;


                const processor = this.manager.animators[animation.name];

                if (!animation.name || !animation.isPlayed || !processor)
                    return false;



                item.playedTime = this.manager.timer - item.startedTime;
                // item.playedTime = Date.now() - item.startedTime;
                if (item.playedTime < animation.delay)
                    return true;

                const time = (item.playedTime - animation.delay);

                let test = time / animation.time;

                // if(animation.loopDelay<animation.time){
                //     if((time%animation.time)<animation.loopDelay)
                //         return true;
                //     let loops = Math.floor(test);
                //     test = (time-animation.loopDelay) / (animation.time-animation.loopDelay*time);
                // }
                let value = test - Math.floor(test);

                if (animation.yoyo)
                    value = 1 - 2 * Math.abs(value - 0.5);

                if (animation.loop && (test >= animation.loop)) {
                    value = (animation.yoyo ? 0 : 1);
                    animation.isPlayed = false;
                }

                //     // value = Math.round(value);
                //     // return false;
                if (animation.reverse)
                    value = 1 - value;

                this.targets.forEach(function (object, index) {
                    const output = processor.next(value, object, animation, item.options);
                    if (typeof animation.value === 'string' && output !== undefined)
                        if (animation.mode == 'add') {
                            object[animation.value] += output;
                        } else {
                            object[animation.value] = output;
                        }
                }, this);

                if (animation.loop && (test >= animation.loop)) {
                    animation.isPlayed = false;
                }

                return animation.isPlayed;

            }, this);

            item.isPlayed = list.some(item => item);
        }, this);
        return this;
    }
}
export default AnimationsWrapper;

window.AnimationsWrapper = AnimationsWrapper;

