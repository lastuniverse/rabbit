import AnimationsWrapper from '../animator/class.animations.wrapper.js'
import { getColorPower, capitalize } from './utils.js'

/**
 * Класс слоя для компонента. В качестве слоя использует sprite.
 */
class ComponentLayerSprite {

    /**
     * @param {ComponentView} component ссылка на инстанс компонента которому принадлежит слой
     * @param {object} config настройки для слоя из конфига компонента
     */
    constructor(component, config) {
        this.component = component; // ссылка на объект компонента которому принадлежит слой
        this.factory = component.factory; // ссылка на объект фабрики которой принадлежит компонент
        this.game = this.factory.game; // ссылка на gameClient
        this.app = this.factory.app; // ссылка на gameClient.engine
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


        this.animations = config.animations; // запоминаем ключи анимаций
        this.layerName = config.layerName; // устанавливаем имя слоя из конфига
        this.componentName = this.component.componentName;


        // устанавливаем спрайт указанный в конфиге слоя
        this.setTexture(config.spriteName, config.frameName);
        // this.setFrame(config.frameName); // устанавливаем кадр указанный в конфиге слоя


        // выставляем начальные параметры спрайта слоя
        this.setOrigin(this.origin.x, this.origin.y)
            .setPosition(0, 0) // установит с учетом позиции указанной в конфиге слоя
            .setScale(1, 1) // установит с учетом scale указанных в конфиге компонента и слоя
            .setAngle(config.angle)
            .setAlpha(config.alpha)
            .setBlendMode(config.blend)
            .hide();
        // ну и главное, анимационная обертка спрайта))))
        this.wrapper = new AnimationsWrapper(this, this.manager);
    }

    /**
     * Останавливает для слоя все анимации и удаляет спрайт.
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * анимации по времени или методами {@link ComponentLayerSprite#stop ComponentLayerSprite.stop()} и {@link ComponentView#stop ComponentView.stop()}.
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
        } else {
            // this.stop(compositionName);
            this.stop(compositionName);
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
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    stop(compositionName) {
        const layerPreset = this.animations[compositionName];
        this.wrapper.stop(layerPreset);
        return this;
    }


    // определяем универсальные методы управления отображением.
    /**
     * Скрыть спрайт.
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    hide() {
        this.sprite.visible = false;
        return this;
    }
    /**
     * Показать спрайт.
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    show() {
        this.sprite.visible = true;
        return this;
    }
    /**
     * Устанавливает у спрайта прозрачность.
     * @param {number} alpha число от 0 (полностью прозрачный) до 1 (полностью непрозрачный)
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setAlpha(alpha) {
        this.sprite.alpha = (typeof alpha === 'number' ? alpha : (this.sprite.alpha || 0));
        return this;
    }


    /**
     * Устанавливает спрайту tint.
     * !!! не может применятся всесте с методами {@link ComponentLayerSprite#setHue ComponentLayerSprite.setHue()} и {@link ComponentLayerSprite#setIllumination ComponentLayerSprite.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint
     * у спрайта.
     * @param {number} tint читайте по данному свойству доку фазера.
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setTint(tint) {
        this.sprite.tint = (typeof tint === 'number' ? tint : (this.sprite.tint || 0xFFFFFF));
        return this;
    }
    /**
     * Mеняет окраску слоя в зависимости от hue, а также
     * меняет освещенность слоя в зависимости от illumination
     * !!! не может применятся всесте с методами {@link ComponentLayerSprite#setTint ComponentLayerSprite.setTint()} и {@link ComponentLayerSprite#setIllumination ComponentLayerSprite.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} hue число от 0 до 1. (точки цветов: 0.166 - красный, 0.5 - зеленый, 0.833 - синий).
     * Окраска произойдет в зависимости от расстояния hue до точек цветов.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * !!! не может применятся всесте с методами {@link ComponentLayerSprite#setTint ComponentLayerSprite.setTint()} и {@link ComponentLayerSprite#setHue ComponentLayerSprite.setHue()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * @returns {ComponentLayerSprite} ссылка на самого себя.
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
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setOrigin(x, y) {
        this.sprite.anchor.x = (typeof x === 'number' ? x : 0.5);
        this.sprite.anchor.y = (typeof y === 'number' ? y : this.sprite.anchor.x);
        return this;
    }
    /**
     * Устанавливает кадр из текущего (для спрайта) атласа по его имени frameName
     * @param {string|number} frameName индекс кадра (число) или имя кадра (строка)
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setFrame(frameName) {
        if (typeof frameName !== 'number' && typeof frameName !== 'string')
            return this;
        if (typeof this.spriteName !== 'string' || !this.spriteName)
            return this;


            this.frameName = frameName;
        const texture = this.getTexture(this.spriteName, this.frameName);
        // this.sprite.setTexture(texture);
        this.sprite.texture = texture;

        // if (typeof frameName === 'number') {
        //     this.sprite.frame = frameName;
        // } else if (typeof frameName === 'string') {
        //     // const frame = this.factory.cache.getFrameByName(this.spriteName, frameName);
        //     // if(frame && frame.index)
        //     //     this.sprite.frame = frame.index;

        //     const frames = this.factory.frames[this.spriteName];
        //     if (!frames) {
        //         this.factory.findFramesData(this.spriteName)
        //         return this;
        //     }

        //     const index = frames[frameName];
        //     if (typeof index !== 'number')
        //         return this;
        //     this.sprite.frame = index;

        //     // this.sprite.frameName = frameName;
        // } else {
        //     throw 'вы пытаетесь установить ' + frameName + ' у спрайта ' + this.spriteName + ' в компоненте ' + this.componentName + '->' + this.layerName;
        // }
        // // this.sprite.frameName = frameName;
        return this;
    }
    /**
     * !!! эта функция может работать некорректно !!!
     * Устанавливает текущий спрайт/картинку/атлас с именем spriteName
     * и кадр из текущего (для спрайта) атласа по его имени frameName
     * @param {string} spriteName имя загруженного спрайта/картинки/атласа
     * @param {string|number} frameName индекс кадра (число) или имя кадра (строка)
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setTexture(spriteName, frameName) {
        if (!spriteName)
            return this;



        if (this.spriteName === spriteName) {
            this.setFrame(frameName);
            return this;
        }


        this.spriteName = spriteName;
        this.frameName = frameName;


        const oldSprite = this.sprite;

        // создаем спрайт, вносим в него имя слоя и ссылку на слой
        this.sprite = this.getSprite(spriteName, frameName);
        this.sprite.layerName = this.config.layerName;
        this.sprite.myLayer = this;
        this.group.addChild(this.sprite);


        // this.sprite.texture.baseTexture.scaleMode = 0;

        // console.log('sprite', this.sprite);

        // if (this.config.smoothed) 
        // this.sprite.smoothed = true;
        // this.sprite.texture.baseTexture.scaleMode = Phaser.scaleModes.DEFAULT;

        // console.log('Phaser.scaleModes', Phaser.scaleModes);
        // Phaser.scaleModes.DEFAULT
        // Phaser.scaleModes.LINEAR
        // Phaser.scaleModes.NEAREST        


        if (oldSprite) {
            this.sprite.x = oldSprite.x;
            this.sprite.y = oldSprite.y;
            this.sprite.alpha = oldSprite.alpha || 1;
            this.sprite.angle = oldSprite.angle || 0;
            this.sprite.anchor.x = oldSprite.anchor.x || 0.5;
            this.sprite.anchor.y = oldSprite.anchor.y || 0.5;
            this.sprite.tint = oldSprite.tint || 0xFFFFFF;
            this.sprite.scale.setTo(oldSprite.scale.x || 1, oldSprite.scale.y || 1);
            oldSprite.destroy();
        }

        return this;
    }

    /**
     * Заглушка. У спрайта нельза установить тайлы. Это можно сделать только у слоя типа tile
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setTiles(x, y) {
        return this;
    }
    /**
     * Заглушка. У спрайта нельзя установить текст. Это можно сделать только у слоя типа text
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
    setText() {
        return this;
    }




    getTillingSprite(spriteName, frameName=0, width, height){
        const texture = this.getTexture(spriteName, frameName);
        return new PIXI.TilingSprite(texture, width, height);
    }
    
    getSprite(spriteName, frameName=0){
        const texture = this.getTexture(spriteName, frameName);
        return new PIXI.Sprite(texture)
    }
    
    getTexture(spriteName, frameName=0){
        if(!spriteName || typeof spriteName !== 'string' ) throw `Sprite ${spriteName} must be nonzero string`;
        const resources = this.app.loader.resources[spriteName];
        if(!resources ) throw `Sprite ${spriteName} must be loaded before used`;
        
        if(resources.textures){
            if( ['string','number'].indexOf(typeof frameName)<0 ) throw `Frame ${frameName} of sprite ${spriteName} must be number or nonzero string`;
            const list = Object.values(resources.textures);
            const frame = resources.textures[frameName]||list[frameName]||list[0];
            return frame;
    
        }else if(resources.texture){
            return resources.texture;
        }else{
            throw 'ups!!!';
        }
    }


}

export default ComponentLayerSprite;
