import ExtendEventEmitter from './utils/class.extend.event.emitter.js'
import ComponentsFactory from './components/class.components.factory.js';
import World from './world/class.world.js';
import Keyboard from './class.keyboard.js';
import {fakeAjax} from './fake.network.js';



// тут возникли проблемы с вебпаком, поэтому заменил
// динамический импорт конфигов компонентов на обычный
import './utils/class.configurations.js'
import '../resources/rabbit.js'
import '../resources/ui_form_leadboard_button_left.js'
import '../resources/ui_form_leadboard_button_ok.js'
import '../resources/ui_form_leadboard_button_right.js'
import '../resources/ui_form_leadboard.js'
import '../resources/ui_form_myrecords_button_leadboard.js'
import '../resources/ui_form_myrecords_button_mi.js'
import '../resources/ui_form_myrecords_button_play.js'
import '../resources/ui_form_myrecords.js'
import '../resources/ui_form_youscore_button_ok.js'
import '../resources/ui_form_youscore.js'


// тут костыль. Если загрузить шрифт через @font-face в css
// но не вывести ни строчки этим шрифтом, то шрифт будет 
// недоступен в PIXI. Поэтому в index.html в body выводим
// текст нужным шрифтом а тут удаляем этот текст
document.body.innerHTML = '';



class Main extends ExtendEventEmitter {
    constructor() {
        super(false);

        // фиктивный метод для имитации запросов к серверу
        this.fakeAjax = fakeAjax;

        // создаем приложение PIXI.JS
        this.app = new PIXI.Application({
            width: 256,         // default: 800
            height: 256,        // default: 600
            // antialias: true,    // default: false
            // transparent: false, // default: false
            // useContextAlpha: false, // default: false
            // resolution: 1,       // default: 1
            // forceCanvas: true
            backgroundColor: 0x061639,
            // autoResize: true
        });

        // добавляем canvas приложения на страницу
        document.body.appendChild(this.app.view);

        // всякое разное
        // this.app.renderer.backgroundColor = 0x061639;
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.resize(window.innerWidth, window.innerHeight);

        // перехватываем клавиатурныесобытия
        this.keyboard = new Keyboard(this);

        // создаем фабрику компонентов (собственная разработка)
        // все формы и кролик сделанны именно на компонентах
        // полное описание компонентов и их API тут:
        // https://work.lastuniverse.ru/api/tutorial-многослойные%20компоненты.html
        // логин и пароль для доступа: test test
        this.factory = new ComponentsFactory(this, './resources/');

        // тут будем хранить игровые объекты
        this.objects = {};

        // оповещаем всех слушателей о начале стадии инициализации 
        this.emit('game.init', this);

        // создаем объект класса World, отвечающий за игровой мир
        this.world = new World(this);

        // передаем управление в секцию preload
        this.preload();
    }

    preload() {
        console.log('[game.preload]');

        // оповещаем всех слушателей о необходимости кинуть ресурсы в загрузку
        this.emit('game.preload', this);

        
        // загружаем конфиги компонентов.
        // заменено на прямой импорт компонентов по причине того, что вебпак 
        // при наличии в модуле динамического импорта собирает все что может
        // быть импортировано (картинки, стили и прочее)
        // надо будет с этим разобратся, а пока так как есть
        // this.factory
        //     .add('ui_form_leadboard.js')
        //     .add('ui_form_myrecords.js')
        //     .add('ui_form_youscore.js');


        // загружаем ресурсы
        // this.app.loader
        // .add('ui','./images/ui.json')
        // .add('rabbit','./images/rabbit.json')
        // .add('rays','./images/rays.png')
        // .add('floor','./images/floor.png')
        // .add('sign','./images/info_plate_big.png')
        // .add('break','./images/stopper_idle.png');


        // this.factory.load(() => {
            // ожидаем завершения загрузки конфигов компонентов
            
            this.app.loader.load(() => {
                // ожидаем завершения загрузки ресурсов игры
                
                this.fakeAjax(
                    'https://lastuniverse.ru/pixi.js/api/user',
                    'GET',
                    {},
                    response=>{
                        // ожидаем загрузки данных пользователя
                        this.userdata = response;
                       
                        // передаем управление в секцию create
                        this.create();
                    }
                );
            });

        // });

    }

    create() {
        console.log('[game.create]');

        // оповещаем всех слушателей о завершении загрузки ресурсов
        this.emit('game.create', this);

        // создаем компоненты UI форм

        this.objects.uiFormMyrecords = this.factory.getComponent('UI_FORM_MYRECORDS')
            .setScale(1.0)
            .setPosition(this.app.screen.width / 2, this.app.screen.height / 2)
            .addToGroup(this.app.stage)
            


        this.objects.uiFormLeadboard = this.factory.getComponent('UI_FORM_LEADBOARD')
            .setScale(1.0)
            .setPosition(this.app.screen.width / 2, this.app.screen.height / 2)
            .addToGroup(this.app.stage);
            

        this.objects.uiFormYouscore = this.factory.getComponent('UI_FORM_YOUSCORE')
            .setScale(1.0)
            .setPosition(this.app.screen.width / 2, this.app.screen.height / 2)
            .addToGroup(this.app.stage);
        

        // открывем ворму 'Мои рекорды'
        this.emit('ui.open.myrecords');
        // this.emit('ui.open.youscore', this.userdata);
        // this.emit('ui.open.leadboard');



        // выставляем приемлемые значения FPS
        this.app.ticker.maxFPS = 60.00;
        this.app.ticker.minFPS = 60.00;

        // ожидаем новой итерации отрисовки сцены
        this.app.ticker.add(multiplier => {
            // запускаем механизм обновления состояния игры
            this.update(this.app.ticker.elapsedMS, multiplier);
        });
    }

    update(elapsedMS, multiplier) {
        // оповещаем всех слушателей о новой итерации цикла отрисовки
        this.emit('game.update', elapsedMS, multiplier);
    }




    // всякое вспомогательное ...
    _getTillingSprite(spriteName, frameName = 0, width, height) {
        const texture = this._getTexture(spriteName, frameName);
        return new PIXI.TilingSprite(texture, width, height);
    }

    _getSprite(spriteName, frameName = 0) {
        const texture = this._getTexture(spriteName, frameName);
        return new PIXI.Sprite(texture)
    }

    _getTexture(spriteName, frameName = 0) {
        if (!spriteName || typeof spriteName !== 'string') throw `Sprite ${spriteName} must be nonzero string`;
        const resources = this.app.loader.resources[spriteName];
        if (!resources) throw `Sprite ${spriteName} must be loaded before used`;

        if (resources.textures) {
            if (['string', 'number'].indexOf(typeof frameName) < 0) throw `Frame ${frameName} of sprite ${spriteName} must be number or nonzero string`;
            const list = Object.values(resources.textures);
            const frame = resources.textures[frameName] || list[frameName] || list[0];
            return frame;

        } else if (resources.texture) {
            return resources.texture;
        } else {
            throw 'ups!!!';
        }
    }

}



const main = new Main();