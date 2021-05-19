const titleTextStyle = {
    fontFamily: 'Zubilo Black',
    fontSize: 62,
    fill: 0x003d71,
    align: 'center',
    fontWeight: 200,
    // dropShadow: true,
    // dropShadowBlur: 7,
    // dropShadowDistance: 10,
    // stroke: 0xaaaaaa,
    // strokeThickness: 10
};

const timeTextStyle = {
    fontFamily: 'Zubilo Black',
    fontSize: 80,
    fill: 0xff6801,
    align: 'center',
    fontWeight: 200,
    dropShadow: true,
    dropShadowAngle: Math.PI / 2,
    dropShadowBlur: 1,
    dropShadowDistance: 6,
    dropShadowAlpha: 0.5,
    // stroke: 0xaaaaaa,
    // strokeThickness: 10
};

const highleaderTextStyle = {
    fontFamily: 'Zubilo Black',
    fontSize: 40,
    // fill : 0xff6801,
    align: 'center',
    fontWeight: 200,
    // dropShadow: true,
    // dropShadowAngle: Math.PI/2,
    // dropShadowBlur: 3,
    // dropShadowDistance: 10,
    // dropShadowAlpha: 0.5,
    // stroke: 0xaaaaaa,
    // strokeThickness: 10
};

const intervals = { alltime: 'Все время', month: 'Месяц', week: 'Неделя' };

const config = {

    // устанавливаем целевое назначение конфига для класса компонентов
    type: 'component',

    // имя компонента
    name: 'UI_FORM_LEADBOARD',

    // используемые спрайты и атласы спрайтов
    // будут доступны из вне, внимательно следите за названиями
    sprites: [
        { name: 'ui_sign', url: '/ui/info_plate_big.png' },
        { name: 'ui_elements', url: '/ui/ui.json' },
    ],

    // если в компоненте мы используем другие компоненты как слои 
    // то загружаем из тут
    components: [
        '/ui_form_leadboard_button_ok.js',
        '/ui_form_leadboard_button_left.js',
        '/ui_form_leadboard_button_right.js',
    ],

    // используемые звуки и атласы звуков
    // будут доступны из вне, внимательно следите за названиями
    audio: [
        // { name: 'legendsoftheseas_preloader_background_sound', sound: '/resources/preloader/legendsoftheseas.preloader/snd_feature_loop.ogg' }
    ],

    // композиция, которая будет установлена при инииализации
    // startComposition: 'game',

    // общее масштабирование всей группы(компонента)
    // может указыватся как `scale: {x:число,y:число}`
    // может указыватся как `scale: число` что будет э{ x: 0, y: -370 },
    // может указыватся как `position: {x:число,y:число}`
    // может указыватся как `position: число` что будет эквивалентно `position: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `position: {x:0,y:0}`
    position: { x: 0, y: 0 },

    // общее масштабирование всей группы(компонента)
    // может указыватся как `scale: {x:число,y:число}`
    // может указыватся как `scale: число` что будет эквивалентно `scale: {x:число,y:число}`
    // если не указанно то по примет значение умолчанию `scale: {x:1,y:1}`
    scale: { x: 0.66, y: 0.66 },

    // настройка композиций.
    // тут мы можем создавать именованные композиции слоев и их анимаций
    // для запуска композиции нужно будет дать компоненту команду play('имя композиции')
    compositions: {
        base: {
            // rays: 'base',
            background: 'base',
            header: 'base',
            text: 'base',
            load: 'base',
            interval: 'base',
            button: 'base',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        },
        table: {
            // rays: 'base',
            background: 'base',
            header: 'base',
            text: 'base',
            interval: 'base',
            button: 'base',
            // GROUP: 'base',
            // SOUND: 'legendsoftheseas_preloader_background_sound',
        }
    },


    // слои компонента
    // все слои отображаются в том порядке, в котором лежат в конфиге
    layers: [
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
            layerName: 'header',
            spriteName: 'ui_elements',
            frameName: 'header_info_plate',
            origin: 0.5,
            position: { x: 0, y: -408 },
            // alpha: 0.5,
        },
        {
            layerType: 'text',
            layerName: 'header',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -462 },
            // alpha: 0.5,
            text: "Таблица рекордов:\n",
            style: titleTextStyle,
        },

        // надпись 'Загрузка'
        {
            layerType: 'text',
            layerName: 'load',
            origin: { x: 0.5, y: 0.5 },
            scale: 1,
            position: { x: 0, y: 0 },
            // alpha: 0.5,
            text: "Загрузка",
            style: titleTextStyle,
        },


        // надписи
        {
            layerType: 'text',
            layerName: 'interval',
            origin: { x: 0.5, y: 0 },
            scale: 1,
            position: { x: 0, y: -370 },
            // alpha: 0.5,
            text: "???\n",
            style: timeTextStyle,
        },


        // кнопки
        {
            layerType: 'component',
            layerName: 'button',
            componentName: 'UI_FORM_LEADBOARD_BUTTON_OK',
            scale: 1.5,
            position: { x: 0, y: 365 },
        },
        {
            layerType: 'component',
            layerName: 'button',
            componentName: 'UI_FORM_LEADBOARD_BUTTON_LEFT',
            scale: 1.5,
            position: { x: -280, y: -313 },
        },
        {
            layerType: 'component',
            layerName: 'button',
            componentName: 'UI_FORM_LEADBOARD_BUTTON_RIGHT',
            scale: 1.5,
            position: { x: 280, y: -313 },
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
        // показывает плашку очередного победителя
        {
            name: 'show_place',
            handler: function (input, object, presetOptions, playOptions) {

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
    ],


    events: [
        {
            name: 'ui.close',
            listener: function () {
                // if (this.isOpen) {
                    this.isOpen = false;
                    this.hide();
                    // this.game.emit('ui.open.myrecords');
                // }
            }
        },
        {
            name: 'ui.open.leadboard',
            listener: function (options={}) {
                this.interval = this.interval||0;
                if( options.turn === 'left' ){
                    this.interval--;
                }else if( options.turn === 'right' ){
                    this.interval++;
                }else{
                    this.interval=0;
                }
                this.interval = (this.interval+3)%3;
                const interval = Object.keys(intervals)[this.interval];
                const text = intervals[interval];
                this.layersMap.interval.setText(text+'\n');
                this.isOpen = true;
                this.play('base', true);
                this.game.fakeAjax(
                    'https://lastuniverse.ru/pixi.js/api/leadboard',
                    'GET',
                    { interval },
                    response => {
                        if(!this.isOpen) return;
                        if(interval !== Object.keys(intervals)[this.interval]) return;
                        // ожидаем загрузки данных таблицы рекордов
                        for(let i=0; i<10; i++){
                            const item = response[i]||{name:'-', score:'-'};
                            this.layersMap[`place_${i+1}_username`].setText(item.name+'\n');
                            this.layersMap[`place_${i+1}_score`].setText(item.score+'\n');
                        }
                        this.play('table', true);
                    }
                )
            }
        },

    ],

};


// было лениво заполнять эти 10 строчек вручную, потому сделал в цикле
for (let i = 0; i < 10; i++) {
    const delay = 70;
    const name = 'place_' + (i + 1);
    const presetName = 'show_place_' + (i + 1);
    const color = [0xc16001, 0x205caf, 0x8a1a00, 0x333333][Math.min(i, 3)];
    const nameFrame = ['place_1', 'place_2', 'place_3', 'midleader_name_plate'][Math.min(i, 3)];
    const scoreFrame = i < 3 ? 'highleader_scores_plate' : 'midleader_scores_plate';
    const offset = i < 3 ? i * 80 : 180 + (i - 2) * 47;
    const x = i < 3 ? [-100, 250, -265, 250] : [-65, 250, -265, 250, -310];
    const fontSize = i < 3 ? 40 : 36;


    // config.compositions.base[name] = 
    config.compositions.table[name] = presetName;
    config.compositions.table[name + '_username'] = presetName;
    config.compositions.table[name + '_score'] = presetName;


    config.presets.push({
        name: presetName,
        params: [
            { time: 1, name: 'animate_reset', loop: 1, alpha: 0 },
            { time: delay * 3, delay: i * delay, name: 'animate_alpha', loop: 1 },
        ]
    });



    config.layers.push(
        { layerType: 'sprite', layerName: name, spriteName: 'ui_elements', frameName: nameFrame, origin: 0.5, position: { x: x[0], y: -240 + offset }, },
        { layerType: 'sprite', layerName: name, spriteName: 'ui_elements', frameName: scoreFrame, origin: 0.5, position: { x: x[1], y: -240 + offset }, },
        { layerType: 'text', layerName: name + '_username', origin: { x: 0, y: 0 }, scale: 1, position: { x: x[2], y: -265 + offset }, text: '-\n ', style: { ...highleaderTextStyle, fill: color, align: 'left', fontSize }, },
        { layerType: 'text', layerName: name + '_score', origin: { x: 0.5, y: 0 }, scale: 1, position: { x: x[3], y: -265 + offset }, text: '-\n ', style: { ...highleaderTextStyle, fill: color, fontSize }, },
    )
    if (i >= 3) {
        config.layers.push(
            { layerType: 'text', layerName: name, origin: { x: 0.5, y: 0 }, scale: 1, position: { x: x[4], y: -265 + offset }, text: (i + 1) + '\n ', style: { ...highleaderTextStyle, fill: 0xffffff }, },
        );
    }
}

configurations.add(config);
export default config;