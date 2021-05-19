const config = {

    // устанавливаем целевое назначение конфига для класса компонентов
    type: 'component',

    // имя компонента
    name: 'UI_FORM_MYRECORDS_BUTTON_PLAY',

    // используемые спрайты и атласы спрайтов
    // будут доступны из вне, внимательно следите за названиями
    sprites: [
        { name: 'ui_elements', url: '/ui/ui.json' },
    ],

    // используемые звуки и атласы звуков
    // будут доступны из вне, внимательно следите за названиями
    audio: [
        { name: 'sound_button_press', url: '/ui/joystick-trigger-button.mp3' }
    ],

    // композиция, которая будет установлена при инииализации
    startComposition: 'active',

    // общее масштабирование всей группы(компонента)
    // может указыватся как `scale: {x:число,y:число}`
    // может указыватся как `scale: число` что будет эквивалентно `scale: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `scale: {x:1,y:1}`
    scale: { x: 1, y: 1 },

    // общее позиционирование всей группы(компонента)
    // может указыватся как `position: {x:число,y:число}`
    // может указыватся как `position: число` что будет эквивалентно `position: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `position: {x:0,y:0}`
    position: { x: 0, y: 0 },

    // настройка композиций.
    // тут мы можем создавать именованные композиции слоев и их анимаций
    // для запуска композиции нужно будет дать компоненту команду play('имя композиции')
    compositions: {
        active: {
            button: 'active',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
        hover: {
            button: 'hover',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
        press: {
            button: 'press',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
    },

    // слои компонента
    // все слои отображаются в том порядке, в котором лежат в конфиге
    layers: [
        {
            // тип слоя ('sprite','tile','text') по умолчанию 'sprite'
            layerType: 'sprite',

            // название слоя
            layerName: 'button',

            // имя загруженного спрайта или атласа с которым будет инициализирован слой
            spriteName: 'ui_elements',

            // имя или номер кадра с которым будет инициализирован слой
            frameName: 'play_button_active',

            // относительное масштабирование слоя (накладывается на общее масштабирование компонента)
            // может указыватся как `scale: {x:число,y:число}`
            // может указыватся как `scale: число` что будет эквивалентно `scale: {x:число,y:число}`
            // если не указанно то по примет значение умолчанию `scale: {x:1,y:1}`

            // относительная позиция слоя (накладывается на общее масштабирование компонента)
            // может указыватся как `position: {x:число,y:число}` что даст сдвиг данного слоя относительно оригина компонента на [x,y]
            // может указыватся как `position: число` что будет эквивалентно `position: {x:число,y:0}`
            // если не указанно то по примет значение умолчанию `position: {x:0,y:0}`
            // position: { x: 429, y: -2 },

            // origin/ancor слоя. независимый параметр для каждого отдельно взятого слоя
            // если x=0 то origin по оси X будет установлен на левый край спрайта
            // если x=1 то origin по оси X будет установлен на правый край спрайта
            // если y=0 то origin по оси Y будет установлен на верхний край спрайта
            // если y=1 то origin по оси Y будет установлен на нижний край спрайта
            // может указыватся как `origin: {x:число,y:число}`
            // может указыватся как `origin: число` что будет эквивалентно `origin: {x:число,y:число}`
            // если не указанно то по примет значение умолчанию `число: {x:0.5,y:0.5}`
            // origin: { x: 0.5, y: 1 },

            // прозрачность слоя. независимый параметр для каждого отдельно взятого слоя 
            // может указыватся как `alpha: число`
            // где:
            // число = 0 - полностью прозрачный
            // число = 1 - полностью НЕ прозрачный
            // если не указанно то по примет значение умолчанию `alpha: 1`
            // alpha: 1,
        },
        
        

    ],

    // настройка пресетов(наборов) анимаций (подробнее в модуле AnimationsManager)
    presets: [
        {
            name: 'active',
            params: [
                { time: 1, name: 'animate_reset', frameName: 'play_button_active', loop: 1},
            ]
        },
        {
            name: 'hover',
            params: [
                { time: 1, name: 'animate_reset', frameName: 'play_button_hover', loop: 1},
            ]
        },
        {
            name: 'press',
            params: [
                { time: 1, name: 'animate_reset', frameName: 'play_button_press', loop: 1 },
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

                if (typeof presetOptions.dy === 'number') object.setPosition(null,presetOptions.dy);

                if (presetOptions.blendmode) {
                    object.setBlendMode(presetOptions.blendmode);
                }

                if (typeof presetOptions.scale === 'number') object.setScale(presetOptions.scale);
                else if (typeof presetOptions.scale === 'object') object.setScale(presetOptions.scale.x, presetOptions.scale.y);

                if (typeof presetOptions.alpha === 'number') object.setAlpha(presetOptions.alpha);
                if (typeof presetOptions.angle === 'number') object.setAngle(presetOptions.angle);
            }
        },
    ],

    on: [

        {
            name: 'down',
            listener: function() {
                this.play('press',true);
                PIXI.sound.play('sound_button_press');
                
            }
        },
        {
            name: 'up',
            listener: function() {
                this.play('hover',true);
                this.game.emit('ui.close');
                this.game.world.reset();
            }
        },
        {
            name: 'over',
            listener: function() {
                this.play('hover', true);
                
            }
        },
        {
            name: 'out',
            listener: function() {
                this.play('active', true);
            }
        },
    ],


    events: [
        {
            name: 'ui.open.myrecords',
            listener: function () {
                this.game.keyboard.setListeners({
                    'SPACE': ()=>{
                        this.play('press',true);
                        PIXI.sound.play('sound_button_press');
                        setTimeout(() => {
                            this.play('active',true);
                            this.game.emit('ui.close');
                            this.game.world.reset();                            
                        }, 200);        

                    },
                }, this);
            }
        },
    ],

};

configurations.add(config);
export default config;