const textStyle = {
    fontFamily: 'Zubilo Black',
    fontSize: 80,
    fill: 0xaa0000,
    align: 'center',
    fontWeight: 200,
};

const config = {

    // устанавливаем целевое назначение конфига для класса компонентов
    type: 'component',

    // имя компонента
    name: 'RABBIT',

    // используемые спрайты и атласы спрайтов
    // будут доступны из вне, внимательно следите за названиями
    sprites: [
        { name: 'entity_rabbit', url: '/rabbit/rabbit.json' },
    ],

    // используемые звуки и атласы звуков
    // будут доступны из вне, внимательно следите за названиями
    audio: [
        // { name: 'legendsoftheseas_preloader_background_sound', sound: '/resources/preloader/legendsoftheseas.preloader/snd_feature_loop.ogg' }
    ],

    // композиция, которая будет установлена при инииализации
    startComposition: 'normal',

    // общее масштабирование всей группы(компонента)
    // может указыватся как `scale: {x:число,y:число}`
    // может указыватся как `scale: число` что будет эквивалентно `scale: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `scale: {x:1,y:1}`
    scale: { x: 0.5, y: 0.5 },

    // общее позиционирование всей группы(компонента)
    // может указыватся как `position: {x:число,y:число}`
    // может указыватся как `position: число` что будет эквивалентно `position: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `position: {x:0,y:0}`
    position: { x: 0, y: 0 },

    // настройка композиций.
    // тут мы можем создавать именованные композиции слоев и их анимаций
    // для запуска композиции нужно будет дать компоненту команду play('имя композиции')
    compositions: {
        normal: {
            // rays: 'base',
            rabbit: 'normal',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
        fly: {
            // rays: 'base',
            rabbit: 'fly',
            distance: 'update',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },        
    },

    // слои компонента
    // все слои отображаются в том порядке, в котором лежат в конфиге
    layers: [
        {
            layerType: 'sprite',
            layerName: 'rabbit',
            spriteName: 'entity_rabbit',
            frameName: 'normal',
            origin:  { x: 0.5, y: 1 },
            // position: { x: 0, y: 0 },
            // alpha: 0.5,
        },
        {
            layerType: 'text',
            layerName: 'distance',
            origin: { x: 0.5, y: 0.5 },
            scale: 1,
            position: { x: 20, y: 20 },
            angle: -8,
            // alpha: 0.5,
            text: "---\n",
            style: textStyle
        },
        
    ],

    // настройка пресетов(наборов) анимаций (подробнее в модуле AnimationsManager)
    presets: [
        {
            name: 'normal',
            params: [
                { time: 1, name: 'animate_reset', loop: 1, frame: 'normal' },
                // { time: 2000, name: 'animate_frames', loop: 0, frames: ['normal', 'up'] },
            ]
        },
        {
            name: 'fly',
            params: [
                { time: 1, name: 'animate_reset', loop: 1, frame: 'up' },
                // { time: 2000, name: 'animate_frames', loop: 0, frames: ['normal', 'up'] },
            ]
        },
        {
            name: 'update',
            params: [
                { time: 1, name: 'update_text', loop: 0},
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
        // меняет текст дистанции
        {
            name: 'update_text',
            handler: function (input, object, presetOptions, playOptions) {
                object.setText(object.game.world.rounddata.distance);
            }
        },
        
        
    ],


    events: [
    ],

};

configurations.add(config);
export default config;