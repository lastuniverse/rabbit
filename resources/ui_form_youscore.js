const titleTextStyle = {
    fontFamily: 'Zubilo Black',
    fontSize: 65,
    fill: 0x003d71,
    align: 'center',
    fontWeight: 200,
};

const scoreTextStyle = {
    ...titleTextStyle,
    fontSize: 200,
    fill: 0x00cc00,
    dropShadow: true,
    dropShadowAngle: Math.PI / 2,
    dropShadowBlur: 1,
    dropShadowDistance: 6,
    dropShadowAlpha: 0.5,
};

const moneyTextStyle = {
    ...scoreTextStyle,
    fontSize: 110,
    fill: 0xf4ad25
};

const flagsTextStyle = {
    ...moneyTextStyle,
    fill: 0x9ac6ff
};



const config = {

    // устанавливаем целевое назначение конфига для класса компонентов
    type: 'component',

    // имя компонента
    name: 'UI_FORM_YOUSCORE',

    // используемые спрайты и атласы спрайтов
    // будут доступны из вне, внимательно следите за названиями
    sprites: [
        { name: 'ui_sign', url: '/ui/info_plate_big.png' },
        { name: 'ui_rays', url: '/ui/rays.png' },
        { name: 'ui_elements', url: '/ui/ui.json' },
    ],

    // если в компоненте мы используем другие компоненты как слои 
    // то загружаем из тут
    components: [
        '/ui_form_youscore_button_ok.js',
        // '/ui_button_arrow_left.js',
        // '/ui_button_arrow_right.js',
    ],


    // используемые звуки и атласы звуков
    // будут доступны из вне, внимательно следите за названиями
    audio: [
        // { name: 'legendsoftheseas_preloader_background_sound', sound: '/resources/preloader/legendsoftheseas.preloader/snd_feature_loop.ogg' }
    ],

    // композиция, которая будет установлена при инииализации
    // startComposition: 'youscore',

    // общее масштабирование всей группы(компонента)
    // может указыватся как `scale: {x:число,y:число}`
    // может указыватся как `scale: число` что будет эквивалентно `scale: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `scale: {x:1,y:1}`
    scale: { x: 0.66, y: 0.66 },

    // общее позиционирование всей группы(компонента)
    // может указыватся как `position: {x:число,y:число}`
    // может указыватся как `position: число` что будет эквивалентно `position: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `position: {x:0,y:0}`
    position: { x: 0, y: -1000 },

    // настройка композиций.
    // тут мы можем создавать именованные композиции слоев и их анимаций
    // для запуска композиции нужно будет дать компоненту команду play('имя композиции')
    compositions: {
        youscore: {
            // rays: 'base',
            background: 'base',
            sprite: 'base',
            text_youscore: 'base',
            text: 'base',
            score: 'base',
            money: 'base',
            distance: 'base',
            button: 'base',

            GROUP: 'shift',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
        newrecord: {
            rays1: 'rotate1',
            // rays2: 'rotate2',
            star: 'noise',

            background: 'base',
            sprite: 'base',
            text_newrecord: 'base',
            text: 'base',
            score: 'base',
            money: 'base',
            distance: 'base',
            button: 'base',

            GROUP: 'shift',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
    },

    // слои компонента
    // все слои отображаются в том порядке, в котором лежат в конфиге
    layers: [
        {
            // тип слоя ('sprite','tile','text') по умолчанию 'sprite'
            layerType: 'sprite',
            layerName: 'rays1',
            spriteName: 'ui_rays',
            frameName: 0,
            origin: 0.5,
            //position: { x: 0, y: 0 },
            alpha: 0.5,
            blend: 'ADD_NPM'
        },
        {
            // тип слоя ('sprite','tile','text') по умолчанию 'sprite'
            layerType: 'sprite',
            layerName: 'rays2',
            spriteName: 'ui_rays',
            frameName: 0,
            origin: 0.5,
            //position: { x: 0, y: 0 },
            alpha: 0.5,
            // blend: 'ADD'
        },


        {
            layerType: 'sprite',
            layerName: 'background',
            spriteName: 'ui_sign',
            frameName: 0,
            origin: 0.5,
            // position: { x: 0, y: 0 },
            // alpha: 0.5,
        },

        // заголовок
        {
            layerType: 'sprite',
            layerName: 'sprite',
            spriteName: 'ui_elements',
            frameName: 'header_info_plate',
            origin: 0.5,
            position: { x: 0, y: -408 },
            // alpha: 0.5,
        },
        {
            layerType: 'text',
            layerName: 'text_newrecord',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -465 },
            // alpha: 0.5,
            text: "Новый рекорд:\n",
            style: titleTextStyle
        },
        {
            layerType: 'text',
            layerName: 'text_youscore',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -465 },
            // alpha: 0.5,
            text: "Твои очки:\n",
            style: titleTextStyle
        },

        // набранные очки
        {
            layerType: 'text',
            layerName: 'score',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -370 },
            // alpha: 0.5,
            text: "0\n",
            style: scoreTextStyle
        },


        // монетки
        {
            layerType: 'sprite',
            layerName: 'sprite',
            spriteName: 'ui_elements',
            frameName: 'collect_coin_icon',
            origin: 0.5,
            position: { x: -240, y: -50 },
            // alpha: 0.5,
        },
        {
            layerType: 'text',
            layerName: 'money',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -120 },
            // alpha: 0.5,
            text: "0\n",
            style: moneyTextStyle
        },


        // флажки
        {
            layerType: 'sprite',
            layerName: 'sprite',
            spriteName: 'ui_elements',
            frameName: 'collect_distance_icon',
            origin: 0.5,
            position: { x: -240, y: 130 },
            // alpha: 0.5,
        },
        {
            layerType: 'text',
            layerName: 'distance',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: 60 },
            // alpha: 0.5,
            text: "0 м\n",
            style: flagsTextStyle
        },

        // кнопки
        {
            layerType: 'component',
            layerName: 'button',
            componentName: 'UI_FORM_YOURSCORE_BUTTON_OK',
            scale: 1.5,
            position: { x: 0, y: 365 },
        },



        // звезды слева
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1,
            position: { x: -506, y: -347 },
            // alpha: 0.5,
            reverse: true,
            middle: 0.4,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 0.7,
            position: { x: -546, y: -116 },
            // alpha: 0.5,
            middle: 0.7,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1.35,
            position: { x: -584, y: 116 },
            // alpha: 0.5,
            reverse: true,
            middle: 0.5,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1.0,
            position: { x: -492, y: 347 },
            // alpha: 0.5,
            middle: 0.3,
        },

        // звезды справа
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1,
            position: { x: 506, y: -347 },
            // alpha: 0.5,
            middle: 0.3,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1.35,
            position: { x: 546, y: -116 },
            // alpha: 0.5,
            reverse: true,
            middle: 0.6,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 0.7,
            position: { x: 584, y: 116 },
            // alpha: 0.5,
            middle: 0.4,
        },
        {
            layerType: 'sprite',
            layerName: 'star',
            spriteName: 'ui_elements',
            frameName: 'star',
            origin: 0.5,
            scale: 1.0,
            position: { x: 492, y: 347 },
            // alpha: 0.5,
            reverse: true,
            middle: 0.7,
        },

    ],

    // настройка пресетов(наборов) анимаций (подробнее в модуле AnimationsManager)
    presets: [
        {
            name: 'base',
            params: [
                // { time: 1, name: 'animate_reset', loop: 1 },
            ]
        },
        {
            name: 'rotate1',
            params: [
                // { time: 1, name: 'animate_reset', loop: 1 },
                { time: 15000, name: 'animate_rotate', loop: 0 },
                { time: 3000, name: 'animate_scale', loop: 0, yoyo: true, from: 0.95, to: 1.2 },

            ]
        },
        {
            name: 'rotate2',
            params: [
                // { time: 1, name: 'animate_reset', loop: 1 },
                { time: 20000, name: 'animate_rotate', loop: 0, reverse: false },
                { time: 1000, name: 'animate_scale', loop: 0, yoyo: true, from: 0.8, to: 1 },

            ]
        },
        {
            name: 'noise',
            params: [
                // { time: 1, name: 'animate_reset', loop: 1 },
                { time: 4500, name: 'star_rotate', loop: 0, yoyo: false, from: -10, to: 10 },
                { time: 3100, name: 'animate_scale', loop: 0, yoyo: true, from: 0.95, to: 1.05 },

            ]
        },
        {
            name: 'shift',
            params: [
                { time: 500, name: 'animate_shift', loop: 1, from: -window.innerHeight/2, to: window.innerHeight/2 },
            ]
        },
        

    ],

    // настройка аниматоров (подробнее в модулях AnimationsManager и AnimationsProcessor)
    animators: [
        // ресетит спрайт и его параметры
        {
            name: 'animate_reset',
            handler: function (input, object, presetOptions, playOptions) {
                if (presetOptions.sprite) {
                    object.setTexture(presetOptions.sprite, presetOptions.frame);
                } else if (presetOptions.frame) {
                    object.setFrame(presetOptions.frame);
                }
                if (presetOptions.frameName) object.setFrame(presetOptions.frameName);

                if (typeof presetOptions.scale === 'number') object.setScale(presetOptions.scale);
                else if (typeof presetOptions.scale === 'object') object.setScale(presetOptions.scale.x, presetOptions.scale.y);

                if (typeof presetOptions.alpha === 'number') object.setAlpha(presetOptions.alpha);
                if (typeof presetOptions.angle === 'number') object.setAngle(presetOptions.angle);
            }
        },
        // меняет кадры спрайта
        {
            name: 'animate_frames',
            handler: function (input, object, presetOptions, playOptions) {
                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : 0)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : presetOptions.frames.length)
                const amount = to - from;
                const index = from + Math.floor(input * amount);
                const frame = presetOptions.frames[index];
                if (presetOptions.sprite) {
                    object.setTexture(presetOptions.sprite, frame);
                } else {
                    object.setFrame(frame);
                }
            }
        },
        // меняет масштабирование спрайта
        {
            name: 'animate_scale',
            handler: function (input, object, presetOptions, playOptions) {
                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : 0)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : 1)
                const delta = to - from;
                const scale = from + input * delta;
                object.setScale(scale);
            }
        },
        // меняет прозрачность спрайта
        {
            name: 'animate_alpha',
            handler: function (input, object, presetOptions, playOptions) {
                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : 0)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : 1)
                const delta = to - from;
                const alpha = from + input * delta;
                object.setAlpha(alpha);
            }
        },
        // меняет угол поворота спрайта
        {
            name: 'animate_rotate',
            handler: function (input, object, presetOptions, playOptions) {
                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : 0)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : 360)
                const delta = to - from;
                const angle = from + input * delta;
                object.setAngle(angle);
            }
        },

        // меняет угол поворота спрайта
        {
            name: 'star_rotate',
            handler: function (input, object, presetOptions, playOptions) {

                const middle = object.config.middle || 0.5;
                input = input < middle ? input * 0.5 / middle : 0.5 + (input - middle) * 0.5 / (1 - middle);
                input = 2 * Math.abs(input - 0.5);
                if (object.config.reverse) input = 1 - input;

                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : 0)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : 360)
                const delta = to - from;
                const angle = from + input * delta;
                object.setAngle(angle);
            }
        },
        // меняет угол поворота спрайта
        {
            name: 'animate_shift',
            handler: function (input, object, presetOptions, playOptions) {
                const from = (typeof presetOptions.from === 'number' ? presetOptions.from : -window.innerHeight/2)
                const to = (typeof presetOptions.to === 'number' ? presetOptions.to : window.innerHeight/2)
                const delta = to - from;
                object.group.y = from + input * delta;                
            }
        },        
    ],


    events: [

        {
            name: 'ui.close',
            listener: function () {
                // if (this.isOpen) {
                    this.isOpen = false;
                    this.group.y = -1000;
                    this.hide();
                // }
            }
        },
        {
            name: 'ui.open.youscore',
            listener: function (options) {
                this.isOpen = true;
                this.layersMap.score.setText(options.score+'\n');
                this.layersMap.money.setText(options.money+'\n');
                this.layersMap.distance.setText(options.distance+' м\n');

                if (options.score > this.game.userdata.score) {
                    this.play('newrecord', true);
                    this.game.userdata = {
                        ...this.game.userdata,
                        ...options
                    };
                    this.game.fakeAjax(
                        'https://lastuniverse.ru/pixi.js/api/user',
                        'POST',
                        options,
                        response=>{}
                    );                    
                } else {
                    this.play('youscore', true);
                }
            }
        },
    ],

};

configurations.add(config);
export default config;