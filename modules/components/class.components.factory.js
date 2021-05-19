import AnimationsManager from '../animator/class.animations.manager.js'
import ComponentView from './class.component.view.js'
import GameTimer from '../utils/class.game.timer.js'


/**
 * Класс - фабрика компонентов
 */
class ComponentsFactory {
    /**
     * @constructor
     * @param {Engine} game ссылка на объект класса {@link Engine}
     * @param {string} resourcesPath имя пути, откуда фабрика будет пытаться грузить ресурсы компонентов
     */
    constructor(game, resourcesPath) {
        // console.log('ComponentsFactory.constructor');
        this.game = game;
        this.app = game.app;
        this.resourcesPath = resourcesPath || '/';


        this.managers = [];
        this.frames = {};
        this.components = [];
        this.componentsConfig = {};
        this.sounds = {};
        this.timer = new GameTimer();
        this.loadedResources = {};
        this.loadedComponents = {};
        this.loadedSounds = {};


        this.promises = [];


        // подключаем все ранее загруженные конфиги компонентов
        configurations.getConfigByType('component').forEach(function (config) {
            // console.log("фабрика подключила конфиг:", config.type, config.name);
            this.addComponentConfig(config);
        }, this);
                
        // устанавливаем слушатели событий
        if (this.game.once && this.game.on) {
            // this.game.once('game.preload', this._preload, this);
            // this.game.once('game.create', this._create, this);
            this.game.on('game.update', this._update, this);
        }
    }

    /**
     * данный метод нужен для правильной отработки встроенного менеджера анимаций
     * При использовании с Phaser этот метод необходимо вызвать в секции .update
     */
    _update(delta, multiplier) {
        this.managers.forEach(function (manager) {
            manager.update(delta);
        }, this);

        if (!this.game.timer && typeof this.game.on !== 'function')
            this.timer.update(delta);
    }

    // add(url) {
    //     const promise = import('../../' + this.resourcesPath + url);

    //     promise
    //         .then(config => {
    //             // console.log('[load component]', config.default.name);
    //             if (config.default)
    //                 this.addComponentConfig(config.default);

    //             // if (this.componentsConfig[config.default.name])
    //         })
    //         .catch(error => {
    //             throw error
    //         });


    //     this.promises.push(promise);

    //     return this;
    // }

    // load(cb = function () { }) {
    //     Promise.all(this.promises).then(() => {
    //         cb();
    //     });
    //     return this;
    // }


    parseConfig(config) {
        if (Array.isArray(config.sprites))
            config.sprites.forEach(function (item) {
                // загрузка спрайтов
                if (!item.url || !item.name)
                    return;

                if (this.loadedResources[item.name] === undefined) {
                    this.loadedResources[item.name] = item.url;
                    this.app.loader.add(
                        item.name,
                        this.resourcesPath + item.url
                    );
                } else if (this.loadedResources[item.name] !== item.url) {
                    throw `Вы пытаетесь загрузить '${item.url}' под именем '${item.name}', но для данного имени уже загружен другой ресурс '${this.loadedResources[item.name]}'`;
                }


            }, this);

        // if (Array.isArray(config.components))
        //     config.components.forEach(function (item) {
        //         // загрузка компонентов
        //         if (!item || typeof item !== 'string')
        //             return;

        //         this.add(item);
        //     }, this);

        if (Array.isArray(config.audio))
            config.audio.forEach(function (item) {
                // загрузка звуков
                if (!item.url || !item.name)
                    return;

                if (this.loadedSounds[item.name] === undefined) {
                    this.loadedSounds[item.name] = item.url;
                    PIXI.sound.add(
                        item.name,
                        {
                            url: this.resourcesPath + item.url,
                            preload: true,
                        }
                    );
                } else if (this.loadedSounds[item.name] !== item.url) {
                    throw `Вы пытаетесь загрузить '${item.url}' под именем '${item.name}', но для данного имени уже загружен другой ресурс '${this.loadedResources[item.name]}'`;
                }


            }, this);

        // config.audio.forEach(function (item) {
        //     // загрузка спрайтов
        //     if (!item.url || !item.name)
        //         return;

        //         this.scene.load.audio(item.name, this.resourcesPath + item.sound, true);


        // }, this);

        if (Array.isArray(config.animators))
            config.animators.forEach(function (item) {
                // инициализация аниматоров
                config.manager.addAnimator(
                    item.name,
                    item.handler
                );
            }, this);

        if (Array.isArray(config.presets))
            config.presets.forEach(function (item) {
                // инициализация пресетов(наборов) анимаций
                config.manager.addPreset(
                    item.name,
                    item.params
                );
            }, this);
    }



    /**
     * Добавляет в фабрику конфигурацию нового компонента. Добавление конфигураций необходимо
     * произвести до вызова метода {@link ComponentsFactory#preload ComponentsFactory.preload(...)}.
     * @param {object} config объект с конфигурацией нового компонента.
     * 
     * @returns {ComponentsFactory} ссылка на самого себя.
     */
    addComponentConfig(config) {
        if (!config.type || config.type !== 'component')
            throw 'Тип подключаемого конфигурациюнного файла не "component"';

        if (!config.name)
            throw 'У компонента не задано имя. Укажите его в конфигурационном файле компонента в свойстве name';

        if (this.componentsConfig[config.name])
            console.warn('Cимвол c именем ' + config.name + ' уже загружен, проверьте, что у вас нет 2-х разных компонентов с одним именем');

        if (!config.sprites)
            config.sprites = [];
        if (!config.components)
            config.components = [];
        if (!config.audio)
            config.audio = [];
        if (!config.sounds)
            config.sounds = {};
        if (!config.compositions)
            config.compositions = {};
        // if(!config.animations) config.animations = {};
        if (!config.layers)
            config.layers = [];
        if (!config.presets)
            config.presets = [];
        if (!config.animators)
            config.animators = [];
        if (!config.events)
            config.events = [];

        config.manager = new AnimationsManager(this.scene);
        this.componentsConfig[config.name] = config;
        this.managers.push(config.manager);

        this.parseConfig(config);

        return this;
    }


    /**
     * Создает новый объект класса ComponentView с конфигурацией, имеющей название name.
     * @param {string} name название конфигурации многослойного анимированного компонента.
     * 
     * @returns {ComponentsView} объект компонента.
     */
    getComponent(name) {
        // console.log('ComponentsFactory.getComponent 1', name);//, this.componentsConfig, this.componentsConfig[name]);

        const config = this.componentsConfig[name];
        if (!config)
            throw 'Не найдена конфигурация для "' + name + '". Добавить ее вы можете в секции GameClient.preload командой ComponentsFactory.addComponentConfig(name, config)';

        config.sounds = this.sounds;
        const component = new ComponentView(this, config);
        this.components.push(component);
        if (config.startComposition) {

            // true тут стоит, чтобы когда компоненты (у которых втавлен как слой
            // другие компоненты) запускали свою анимацию, то не сбрасывали стартовую
            // анимацию своих субкомпонентов
            component.play(config.startComposition, true);
        };
        return component;
    }

    /**
     * Метод уничтожает текущий инстанс фабрики, а так же все созданные данной фабрикой
     * инстансы компонентов и все их внутренние объекты (группы, спрайты, менеджеры анимаций).
     */
    destroy() {
        this.manager.stop();
        this.manager.destroy();
        this.components.forEach(function (component) {
            component.destroy();
        });
    }
}

export default ComponentsFactory;
