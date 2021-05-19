import AnimationsWrapper from '../animator/class.animations.wrapper.js'
import ComponentLayerSprite from './class.component.layer.sprite.js'
import ComponentLayerTile from './class.component.layer.tile.js'
import ComponentLayerText from './class.component.layer.text.js'
import ComponentLayerComponent from './class.component.layer.component.js'
import ComponentLayerBitmapText from './class.component.layer.bitmaptext.js'
import { getColorPower, capitalize } from './utils.js'

/**
 * Класс многослойного, анимированного компонента.
 */
class ComponentView {
    /**
     * @constructor
     * @param {ComponentFactory} factory ссылка на фабрику инициирующую создание компонента.
     * @param {object} config конфигурация компонента.
     */
    constructor(factory, config) {
        this.game = factory.game;
        this.app = factory.app;
        this.factory = factory;
        this.config = config;
        this.manager = config.manager;
        this.wrapper = new AnimationsWrapper(this, this.manager);
        this.callbacks = {};
        this.sounds = this.config.sounds || {};
        this.events = [];
        this.inputHandlers = [];
        this.component = this;
        this.group = new PIXI.Container();


        if (Array.isArray(config.on) && config.on.length) {
            // проверяем наличие обработчиков событий ввода
            this.inputHandlers = config.on.filter(function (item) {
                if (!item.name || typeof item.name !== 'string') return false;
                if (!item.listener || typeof item.listener !== 'function') return false;
                item.name = item.name.toLocaleLowerCase();
                if (['down', 'over', 'out', 'up'].indexOf(item.name) < 0) return false;
                return true;

            });
        }

        if (this.inputHandlers && this.inputHandlers.length) {
            // если обработчики событий ввода есть, то элемент интерактивный

            this.group.interactive = true; //     this.group.inputEnableChildren = true;

            // устанавливаем обработчики событий ввода
            this.inputHandlers.forEach(function (item) {
                const listener = item.listener.bind(this);
                // this.group.on('mouse' + item.name, listener);
                this.group.on('pointer' + item.name, listener);
            }, this);
        }


        // запоминаем масштабирование компонента указанное в конфиге.
        // метод .setScale() работает с учетом этого масштабирования
        this.scale = {
            x: !config.scale ? 1 : (typeof config.scale === 'number' ? config.scale : (config.scale.x ? config.scale.x : 1)),
            y: !config.scale ? 1 : (typeof config.scale === 'number' ? config.scale : (config.scale.y ? config.scale.y : 1)),
        };

        // запоминаем смещение позиции компонента указанную в конфиге.
        // метод .setPosition() работает с учетом этой позиции
        this.position = {
            x: !config.position ? 0 : (typeof config.position === 'number' ? config.position : (config.position.x ? config.position.x : 0)),
            y: !config.position ? 0 : (typeof config.position === 'number' ? 0 : (config.position.y ? config.position.y : 0)),
        };


        this.componentName = config.name; // устанавливаем имя слоя из конфига


        // разгребаем config.compositions добавляя в слои
        // секцию animations содержащую события и пресеты
        // для конкретного слоя
        this.constructLayer();

        // инициализируем слои
        this.layersMap = {};
        this.layers = config.layers
            .filter(function (item, index) {
                if (!item.layerName)
                    return false;
                if (!item.animations)
                    return false;
                if (!Object.keys(item.animations).length)
                    return false;
                return true;
            }, this)
            .map(function (item) {
                // console.log('Component layer', this.componentName, item.layerName, item.layerType);
                if (item.layerType === 'text') {
                    const layer = new ComponentLayerText(this, item);
                    this.layersMap[item.layerName] = layer;
                    return layer;
                } else if (item.layerType === 'bitmaptext') {
                    if (!item.fontName) return false;
                    const layer = new ComponentLayerBitmapText(this, item);
                    this.layersMap[item.layerName] = layer;
                    return layer;
                } else if (item.layerType === 'tile') {
                    if (!item.spriteName) return false;
                    const layer = new ComponentLayerTile(this, item);
                    this.layersMap[item.layerName] = layer;
                    return layer;
                } else if (item.layerType === 'component') {
                    if (!item.componentName) return false;
                    if (!this.factory.componentsConfig[item.componentName]) return false;
                    const layer = new ComponentLayerComponent(this, item);
                    // const layer = this.factory.getComponent(item.componentName);                    
                    this.layersMap[item.layerName] = layer;
                    return layer;
                } else {
                    if (!item.spriteName) return false;
                    const layer = new ComponentLayerSprite(this, item);
                    this.layersMap[item.layerName] = layer;
                    return layer;
                }
            }, this)
            .filter(function (item, index) {
                return !!item;
            }, this);




        if (config.events && this.factory.game.once && this.factory.game.on && this.factory.game.emit) {
            // запоминаем обработчики событий
            this.events = config.events.map(function (item) {
                // инициализация слушателей событий

                const listener = item.listener.bind(this)

                this.factory.game.on(item.name, listener);
                return {
                    name: item.name,
                    listener: listener
                };
            }, this);
        }

        this.setPosition(0, 0);
        this.setScale(1);
    }

    /**
     * поместить ргуппу компонента в указанную группу
     * @param {PIXI.Container} group 
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    addToGroup(group) {
        group.addChild(this.group);
        // this.group.updateTransform();
        // this.group.containerUpdateTransform();
        return this;
    }

    // СЛУЖЕБНЫЙ метод просматривает config.compositions и пересобирает данные в удобном для прогаммы виде.
    constructLayer() {
        const animations = {};
        Object.keys(this.config.compositions).forEach(function (compositionName) {
            Object.keys(this.config.compositions[compositionName]).forEach(function (layerName) {
                animations[layerName] = animations[layerName] || {};
                animations[layerName][compositionName] = this.config.compositions[compositionName][layerName];

            }, this);
        }, this);
        this.config.layers.forEach(function (layer) {
            layer.animations = animations[layer.layerName];
        }, this);
        this.config.animations = animations['GROUP'];
        // this.config.sounds[animations['SOUND']];
    }

    /**
     * Вычисляет длину анимации для compositionName. В качестве длительности
     * будет взята самая длинная анимация из используемых в композиции.
     * @param {string} compositionName наименование композиции.
     * 
     * @returns {number} длительность анимации (миллисекунды), либо Infinity
     * в случае бесконечной анимации.
     */
    getDuration(compositionName) {
        const composition = this.config.compositions[compositionName];
        if (!composition) return 0;

        let duration = 0;
        Object.values(composition).some(function (presetName) {
            const presets = this.config.manager.presets[presetName];
            if (!presets) return false;
            return presets.some(function (preset) {
                if (!preset) return false;
                if (preset.loop === 0) {
                    duration = Infinity;
                    return true;
                }
                const presetDuration = (preset.delay || 0) + ((preset.time || 0) * (preset.loop || 0));
                if (duration < presetDuration) duration = presetDuration;
                return false;
            }, this);
        }, this);

        return duration;
    }

    /**
     * Запускает отрисовку именованной комбинацию слоев (каждый слой со своей анимацией).
     * Комбинации должны быть созданы в конфиге. Параметры можно передавать в любом порядке, 
     * метод сам определит что есть что по их типам:
     * @param {string} compositionName имя комбинации.
     * @param {object} options объект с доп параметрами, передаваемыми четвертым аргументом
     * в аниматоры, объявленные в конфиге компонента. если объект задан то options
     * в аниматорах будет обновлен.
     * @param {boolean} isStop если true то принудительно останавливает уже играющие анимации.
     * @param {function} callback функция обратного вызова. Будет вызвана при завершении
     * анимации по времени или методом {@link ComponentView#stop ComponentView.stop()}.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    play(...args) {
        // было много путаницы, поэтому теперь параметры можно передавать в любом порядке
        let compositionName, options, isStop, callback;

        args.forEach(function (item) {
            if (typeof item === 'string') {
                if (compositionName === undefined) compositionName = item;
                return;
            }
            if (typeof item === 'object' && !Array.isArray(item)) {
                if (options === undefined) options = item;
                return;
            }
            if (typeof item === 'boolean') {
                if (isStop === undefined) isStop = item;
                return;
            }
            if (typeof item === 'function') {
                if (callback === undefined) callback = item;
                return;
            }
        }, this);

        // console.log(1, 'ComponentView.play', this.config.name, compositionName);
        if (!compositionName || !this.config.compositions[compositionName]) {
            this.hide();
            return this;
        } else {
            this.show();
        }


        // console.log(2, 'ComponentView.play', this.config.name, compositionName);

        this.currentAnimation = compositionName;
        this.layers.forEach(function (layer) {
            layer.play(compositionName, options, isStop);
        }, this);

        if (this.config.animations) {
            const preset = this.config.animations[compositionName];
            if (true === isStop) {
                this.wrapper.stop();
            }
            if (preset) {
                const self = this;
                this.wrapper.play(preset, options, isStop);
            }
        }
        // const soundName = this.config.compositions[compositionName].SOUND;
        // const sound = this.factory.sounds[soundName];

        // if (soundName && sound) {
        //     // console.log('sound',sound);
        //     if (sound && typeof sound === 'object') {
        //         // console.log('sound.play');
        //         sound.play();
        //     }
        // }

        // если callback-а нет- выходим
        if (typeof callback !== 'function') return this;

        // получим длительность самой долгой анимации
        const duration = this.getDuration(compositionName);

        // если анимация бесконечная - выходим
        if (duration === Infinity) return this;

        // если длительность анимации равна 0 - выполняем коллбэки и выходим
        if (duration === 0) {
            callback.call(this);
            return this;
        }


        // запоминаем общую callback функцию в this.callbacks[compositionName]
        this.callbacks[compositionName] = this.callbacks[compositionName] || [];
        this.callbacks[compositionName].push({
            compositionName: compositionName,
            options: options,
            callback: callback
        });

        // иначе запускаем таймер
        this.factory.setTimer(function () {
            this.execCallbacks(compositionName);
        }, duration + 1, this);
        return this;
    }

    /**
     * Останавливает анимацию именованной комбинации слоев.
     * @param {string} compositionName название именованной комбинации слоев.
     * Если не задано то будут остановленны все текущие анимации компонента
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    stop(compositionName) {
        // console.warn(3, 'ComponentView.stop', this.config.name, compositionName);
        this.layers.forEach(function (layer) {
            layer.stop(compositionName);
        }, this);


        if (this.config.animations) {
            const preset = this.config.animations[compositionName];
            this.wrapper.stop(preset);
        }

        this.execCallbacks(compositionName);

        return this;
    }


    // СЛУЖЕБНЫЙ
    // Вызывает все callback-и для compositionName, если же compositionName не задана 
    // то вызовет все callback-и для всех композиций. При этом все вызванные callback-и
    // будут удалены для предотвращения повторного вызова.
    // @param {string} compositionName название композиции.
    execCallbacks(compositionName) {
        if (compositionName) {
            const callbacks = this.callbacks[compositionName];
            if (callbacks === undefined) return;
            delete this.callbacks[compositionName];
            if (!Array.isArray(callbacks) || !callbacks.length) return;
            callbacks.forEach(function (item) {
                if (typeof item.callback === 'function')
                    item.callback.call(this);
            }, this);
        } else {
            if (this.callbacks === undefined) return;
            const list = Object.values(this.callbacks)
            this.callbacks = {};
            list.forEach(function (callbacks) {
                if (!Array.isArray(callbacks) || !callbacks.length) return;
                callbacks.forEach(function (item) {
                    if (typeof item.callback === 'function')
                        item.callback.call(this);
                }, this);
            }, this);
        }
    }
    /**
     * Останавливает все анимации и удаляет все слои(спрайты)
     * !!! если группа компонента была включена в состав другой группы,
     * то она будет из нее автоматически удалена
     */
    destroy() {
        if (this.isDestroy) return;

        this.isDestroy = true;

        this.wrapper.destroy();

        const index = this.factory.components.indexOf(this);
        if (index >= 0) {
            this.factory.components.splice(index, 1);
        }

        this.layers.slice(0).forEach(function (layer) {
            layer.destroy();
        }, this);

        this.events.forEach(function (item) {
            // инициализация слушателей событий
            this.factory.game.removeListener(item.name, item.listener);
        }, this);

        this.group.interactive = false; // this.group.inputEnableChildren = false;

        this.group.destroy();
        delete this.factory;
        delete this.game;
        delete this.app;
        delete this.config;
        delete this.manager;
        delete this.wrapper;
        delete this.events;
        delete this.group;
        delete this.callbacks;
        delete this.sounds;

        return;
    }

    // определяем универсальные методы управления отображением
    /**
     * Скрыть весь компонент.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    hide() {
        this.group.visible = false;
        return this;
    }

    /**
     * Показать весь компонент.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    show() {
        this.group.visible = true;
        return this;
    }

    /**
     * Устанавливает у группы компонента прозрачность.
     * @param {number} alpha число от 0 (полностью прозрачный) до 1 (полностью непрозрачный).
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setAlpha(value) {
        this.group.alpha = (typeof value === 'number' ? value : (this.group.alpha || 0));
        return this;
    }
    /**
     * Устанавливает всем слоям компонента tint.
     * !!! не может применятся всесте с методами {@link ComponentView#setHue ComponentView.setHue()} и {@link ComponentView#setIllumination ComponentView.setIlluminaton()},
     * так как все три метода работают путем устанавки свойства tint
     * у группы компонента.
     * @param {number} tint читайте по данному свойству доку фазера.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setTint(tint) {
        this.layers.forEach(function (layer) {
            // layer.setTint(tint);
            layer.sprite.tint = tint;
        }, this);
        return this;
    }
    /**
     * Mеняет окраску всех слоев компонента в зависимости от hue, а также
     * меняет освещенность всех слоев компонента в зависимости от illumination
     * !!! не может применятся всесте с методами {@link ComponentView#setTint ComponentView.setTint()} и {@link ComponentView#setIllumination ComponentView.setIlluminaton()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} hue число от 0 до 1. (точки цветов: 0.166 - красный, 0.5 - зеленый, 0.833 - синий).
     * Окраска произойдет в зависимости от расстояния hue до точек цветов.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setHue(hue, illumination) {
        const i = (typeof illumination === 'number' ? illumination : 1);
        const h = (typeof hue === 'number' ? hue : 1);

        const r = Math.floor(i * getColorPower(h, 0.166, 0.25));
        const g = Math.floor(i * getColorPower(h, 0.5, 0.25));
        const b = Math.floor(i * getColorPower(h, 0.833, 0.25));

        const tint = (r << 16) + (g << 8) + b;

        this.layers.forEach(function (layer) {
            // layer.setHue(hue, illumination);
            layer.sprite.tint = tint;
        }, this);
        return this;
    }

    /**
     * Меняет освещенность всех слоев компонента в зависимости от illumination.
     * !!! не может применятся всесте с методами {@link ComponentView#setTint ComponentView.setTint()} и {@link ComponentView#setHue ComponentView.setHue()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setIllumination(illumination) {
        this.layers.forEach(function (layer) {
            layer.setIllumination(illumination);
        }, this);
        return this;
    }

    /**
     * Меняет угол поворота группы компонента в зависимости от angle.
     * @param {number} angle угол поворота группы слоев относительно origin-а компонента.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setAngle(angle) {
        this.group.angle = (typeof angle === 'number' ? angle : (this.group.angle || 0));
        return this;
    }

    /**
     * устанавливает для слоя режим смешивания/наложения
     * @param {string} mode режим смешивания/наложения
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setBlendMode(mode) {
        this.layers.forEach(function (layer) {
            layer.setBlendMode(mode);
        }, this);
        return this;
    }

    /**
     * Устанавливает координаты у группы слоев компонента в зависимости от x,y.
     * @param {number} x координата на сцене по оси Х.
     * @param {number} y координата на сцене по оси Y.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setPosition(x, y) {
        this.group.x = (typeof x === 'number' ? this.position.x + x : (this.group.x || 0));
        this.group.y = (typeof y === 'number' ? this.position.y + y : (this.group.y || 0));
        return this;
    }

    /**
     * Устанавливает масштабирование у группы слоев компонента в зависимости от x,y.
     * @param {number} x масштаб по оси Х.
     * @param {number} y масштаб по оси Y.
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setScale(x, y) {
        this.group.scale.x = this.scale.x * (typeof x === 'number' ? x : 1);
        this.group.scale.y = this.scale.y * (typeof y === 'number' ? y : x);
        return this;
    }

    /**
     * Заглушка. основа компонента это группа.В Phaser-е у групп отсутствует origin
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setOrigin(x, y) {
        return this;
    }
    /**
     * Заглушка. У спрайта нельза установить тайлы. Это можно сделать только у слоя типа tile
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setTiles(x, y) {
        return this;
    }
    /**
     * Заглушка. У группы нельзя установить frame. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setFrame() {
        return this;
    }
    /**
     * Заглушка. У группы нельзя установить текстуру. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setTexture() {
        return this;
    }
    /**
     * заглушка. У компонента нельзя установить текст. Это можно сделать только у слоя типа text
     * 
     * @returns {ComponentView} ссылка на самого себя.
     */
    setText() {
        return this;
    }

}

export default ComponentView;
