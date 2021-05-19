import AnimationsWrapper from '../animator/class.animations.wrapper.js'
import { getColorPower, capitalize } from './utils.js'

/**
 * Класс слоя для компонента. В качестве слоя использует text.
 */
class ComponentLayerText {

    /**
     * @constructor
     * @param {ComponentView} component ссылка на инстанс компонента которому принадлежит слой
     * @param {object} config настройки для слоя из конфига компонента
     */
    constructor(component, config) {
        this.component = component; // ссылка на объект компонента которому принадлежит слой
        this.factory = component.factory; // ссылка на объект фабрики которой принадлежит компонент
        this.game = this.factory.game; // ссылка на gameClient
        this.scene = component.scene; // ссылка на gameClient.engine
        this.manager = component.manager; // ссылка на менеджер анимации
        this.group = component.group; // ссылка на группу спрайтов компонента
        this.config = config; // запомнили конфиг слоя


        // запоминаем масштабирование слоя указанное в конфиге.
        // метод .setScale() работает с учетом этого масштабирования
        this.scale = {
            x: !config.scale ? 1 : (typeof config.scale === 'number' ? config.scale : (config.scale.x ? config.scale.x : 1)),
            y: !config.scale ? 1 : (typeof config.scale === 'number' ? config.scale : (config.scale.y ? config.scale.y : 1)),
        };
        // запоминаем позицию слоя указанную в конфиге.
        // метод .setPosition() работает с учетом этой позиции
        this.position = {
            x: !config.position ? 0 : (typeof config.position === 'number' ? config.position : (config.position.x ? config.position.x : 0)),
            y: !config.position ? 0 : (typeof config.position === 'number' ? 0 : (config.position.y ? config.position.y : 0)),
        };
        // запоминаем origin.
        this.origin = {
            x: (typeof config.origin === 'number' ? config.origin : (typeof config.origin === 'object' && typeof config.origin.x === 'number' ? config.origin.x : 0.5)),
            y: (typeof config.origin === 'number' ? config.origin : (typeof config.origin === 'object' && typeof config.origin.y === 'number' ? config.origin.y : 0.5))
        };

        // запоминаем style.
        this.style = (typeof config.style === 'object' ? config.style : {});

        this.animations = config.animations; // запоминаем ключи анимаций
        this.layerName = config.layerName; // устанавливаем имя слоя из конфига


        // устанавливаем спрайт тект в конфиге слоя
        // this.sprite = this.scene.add.text(0, 0, config.text, this.style);
        this.sprite = new PIXI.Text(
            config.text,
            this.style
        );
        // this.sprite.align = this.align;
        // this.sprite.autoCull = true;
        // this.sprite.checkWorldBounds = true;


        // this.sprite.useAdvancedWrap  = true;
        // this.sprite.wordWrap  = true;
        // this.counter.setShadow(3, 3, 'rgba(0,0,0,1.0)', 3);

        if(typeof this.style.lineSpacing === 'number'){
            this.sprite.lineSpacing = this.style.lineSpacing;
        }

        // выставляем начальные параметры спрайта слоя
        this.setText(config.text)
            .setOrigin(this.origin.x, this.origin.y)
            .setPosition(0, 0) // установит с учетом позиции указанной в конфиге слоя
            .setScale(1, 1) // установит с учетом scale указанных в конфиге компонента и слоя
            .setAngle(config.angle)
            .setAlpha(config.alpha)
            .hide();

        this.group.addChild(this.sprite);

        // ну и главное, анимационная обертка спрайта))))
        this.wrapper = new AnimationsWrapper(this, this.manager);
    }

    /**
     * Останавливает для слоя все анимации и удаляет объект Phaser.text.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    destroy() {
        this.wrapper.destroy();
        const index = this.component.layers.indexOf(this);
        if (index >= 0) {
            this.component.layers.splice(index, 1);
        }
        this.group.remove(this.sprite);
        this.sprite.destroy();
        return this;
    }

    /**
     * Запускает отрисовку отрисовку слоя с назначенной ему анимацией.
     * @param {string} compositionName имя комбинации.
     * @param {object} options объект с доп параметрами, передаваемыми четвертым аргументом
     * в аниматоры, объявленные в конфиге компонента. если объект задан то options
     * в аниматорах будет обновлен.
     * @param {boolean} isStop если true то принудительно останавливает уже играющие анимации.
     * анимации по времени или методами {@link ComponentLayerText#stop ComponentLayerText.stop()} и {@link ComponentView#stop ComponentView.stop()}.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    play(compositionName, options, isStop) {
        const layerPreset = this.animations[compositionName];
        if (true === isStop) {
            this.stop();
            this.hide();
        }

        if (layerPreset) {
            this.wrapper.play(layerPreset, options, isStop);
            this.show();
        }else{
            this.stop();
            this.hide();
        }
        return this;
    }

    /**
     * Останавливает анимацию слоя.
     * @param {string} compositionName название именованной комбинации слоев
     * из которой будет взято название пресета останавливаемой анимации.
     * Если не задано то будут остановленны все текущие анимации слоя.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    stop(compositionName) {
        const layerPreset = this.animations[compositionName];
        this.wrapper.stop(layerPreset);
        return this;
    }

    // определяем универсальные методы управления отображением
    /**
     * Скрыть текст.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    hide() {
        this.sprite.visible = false;
        return this;
    }
    /**
     * Показать текст.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    show() {
        this.sprite.visible = true;
        return this;
    }
    /**
     * Устанавливает у текста прозрачность.
     * @param {number} alpha число от 0 (полностью прозрачный) до 1 (полностью непрозрачный)
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setAlpha(alpha) {
        this.sprite.alpha = (typeof alpha === 'number' ? alpha : (this.sprite.alpha || 0));
        return this;
    }
    /**
     * Устанавливает тексту tint.
     * !!! не может применятся всесте с методами {@link ComponentLayerText#setHue ComponentLayerText.setHue()} и {@link ComponentLayerText#setIllumination ComponentLayerText.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint
     * у текста.
     * @param {number} tint читайте по данному свойству доку фазера.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setTint(tint) {
        this.sprite.tint = (typeof tint === 'number' ? tint : (this.sprite.tint || 0xFFFFFF));
        return this;
    }
    /**
     * Mеняет окраску слоя в зависимости от hue, а также
     * меняет освещенность слоя в зависимости от illumination
     * !!! не может применятся всесте с методами {@link ComponentLayerText#setTint ComponentLayerText.setTint()} и {@link ComponentLayerText#setIllumination ComponentLayerText.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} hue число от 0 до 1. (точки цветов: 0.166 - красный, 0.5 - зеленый, 0.833 - синий).
     * Окраска произойдет в зависимости от расстояния hue до точек цветов.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setHue(hue, illumination) {
        const i = (typeof illumination === 'number' ? illumination : 1);
        const h = (typeof hue === 'number' ? hue : 1);

        const r = Math.floor(i * getColorPower(h, 0.166, 0.25));
        const g = Math.floor(i * getColorPower(h, 0.5, 0.25));
        const b = Math.floor(i * getColorPower(h, 0.833, 0.25));

        this.sprite.tint = (r << 16) + (g << 8) + b;
        return this;
    }
    /**
     * Меняет освещенность слоя в зависимости от illumination.
     * !!! не может применятся всесте с методами {@link ComponentLayerText#setTint ComponentLayerText.setTint()} и {@link ComponentLayerText#setHue ComponentLayerText.setHue()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setIllumination(illumination) {
        const q = Number.parseInt(255 * (typeof illumination === 'number' ? illumination : 1));
        this.sprite.tint = (q << 16) + (q << 8) + q;
        return this;
    }
    /**
     * Устанавливает для слоя угол (относительный) вращения слоя (вокруг origin слоя).
     * @param {number} angle угол поворота слоя внутри группы родительского компонента.
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setAngle(angle) {
        this.sprite.angle = (typeof angle === 'number' ? angle : (this.sprite.angle || 0));
        return this;
    }
    /**
     * устанавливает для слоя режим смешивания/наложения
     * @param {string} mode режим смешивания/наложения
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
     setBlendMode(mode) {
        const blendmode = PIXI.BLEND_MODES[mode] || PIXI.BLEND_MODES['NORMAL'];
        this.sprite.blendMode = blendmode;
        return this;
    }    
    /**
     * устанавливает для слоя позицию относительно позиции, указанной в конфиге слоя.
     * @param {number} x относительная координата по оси X
     * @param {number} y относительная координата по оси Y
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setPosition(x, y) {
        this.sprite.x = this.position.x + (typeof x === 'number' ? x : (this.sprite.x || 0));
        this.sprite.y = this.position.y + (typeof y === 'number' ? y : (this.sprite.y || 0));
        return this;
    }
    /**
     * устанавливает для слоя масштабирование относительно масштаба, указанного в конфиге слоя
     * @param {number} x относительный масштаб по оси X
     * @param {number} y относительный масштаб по оси Y
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setScale(x, y) {
        this.sprite.scale.x = this.scale.x * (typeof x === 'number' ? x : 1);
        this.sprite.scale.y = this.scale.y * (typeof y === 'number' ? y : x);
        return this;
    }
    /**
     * устанавливает для слоя центральную точку (origin, anchor)
     * @param {number} x (число от 0 до 1) координата origin-а по оси X:
     *                   0-левый край спрайта
     *                   1-правый край спрайта)
     * @param {number} y (число от 0 до 1) координата origin-а по оси Y:
     *                   0-верхний край спрайта
     *                   1-нижний край спрайта)
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setOrigin(x, y) {
        this.sprite.anchor.x = (typeof x === 'number' ? x : 0.5);
        this.sprite.anchor.y = (typeof y === 'number' ? y : this.sprite.anchor.x);
        return this;
    }
    /**
     * Устанавливает текст
     * @param {string} text произвольный текст
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setText(text) {
        if (['number', 'string'].indexOf(typeof text) < 0){
            // console.warn('!!!','text is not number or string')
            text = '';
        } 
        // this.sprite.setText(text.toString());
        this.sprite.text = text.toString();
        // this.sprite.updateText(true);
        // this.setPosition(0,0)
        return this;
    }
    /**
     * Заглушка. У текста нельзя установить кадр. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setFrame() {
        return this;
    }
    /**
     * Заглушка. У текста нельзя установить текстуру. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setTexture() {
        return this;
    }
    /**
     * Заглушка. У текста нельза установить тайлы. Это можно сделать только у слоя типа tile
     * 
     * @returns {ComponentLayerText} ссылка на самого себя.
     */
    setTiles() {
        return this;
    }

}

export default ComponentLayerText;
