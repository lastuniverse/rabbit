import AnimationsWrapper from '../animator/class.animations.wrapper.js'
import { getColorPower, capitalize } from './utils.js'

/**
 * Класс слоя для компонента. В качестве слоя использует tile.
 */
class ComponentLayerTile {

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
        this.cacheFrameSizes = {}; // сюда будем кэшировать размеры кадров/картинок для тайлов



        // тут метод this.factory.findFramesData соберет данные о загруженных атласах и их кадах
        // хранилище будет общим для всех компонентов и слоев фабрики
        this.frames = this.factory.frames;

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
        // запоминаем количество тайлов.
        this.tiles = {
            x: !config.tiles ? 1 : (typeof config.tiles === 'number' ? config.tiles : (config.tiles.x ? config.tiles.x : 1)),
            y: !config.tiles ? 1 : (typeof config.tiles === 'number' ? config.tiles : (config.tiles.y ? config.tiles.y : 1)),
        };
        // запоминаем origin.
        this.origin = {
            x: (typeof config.origin === 'number' ? config.origin : (typeof config.origin === 'object' && typeof config.origin.x === 'number' ? config.origin.x : 0.5)),
            y: (typeof config.origin === 'number' ? config.origin : (typeof config.origin === 'object' && typeof config.origin.y === 'number' ? config.origin.y : 0.5))
        };

        this.animations = config.animations; // запоминаем ключи анимаций
        this.layerName = config.layerName; // устанавливаем имя слоя из конфига

        // устанавливаем спрайт указанный в конфиге слоя
        this.setTexture(config.spriteName, config.frameName); // устанавливаем спрайт указанный в конфиге слоя
        // this.setFrame(config.frameName); // устанавливаем кадр указанный в конфиге слоя


        // выставляем начальные параметры спрайта слоя
        this.setOrigin(this.origin.x, this.origin.y)
            .setScale(1, 1)  // установит с учетом scale указанных в конфиге компонента и слоя
            .setAngle(config.angle)
            .setAlpha(config.alpha)
            .setTiles(this.tiles.x, this.tiles.y)
            .setPosition(0, 0)  // установит с учетом scale указанных в конфиге компонента и слоя
            .hide();

        // ну и главное, анимационная обертка спрайта))))
        this.wrapper = new AnimationsWrapper(this, this.manager);
    }

    /**
     * Останавливает для слоя все анимации и удаляет тайл.
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
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
     * анимации по времени или методами {@link ComponentLayerTile#stop ComponentLayerTile.stop()} и {@link ComponentView#stop ComponentView.stop()}.
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
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
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    stop(compositionName) {
        const layerPreset = this.animations[compositionName];
        this.wrapper.stop(layerPreset);
        return this;
    }

    // СЛУЖЕБНЫЙ
    getFrameSize(spriteName, frameName) {
        const cacheKey = spriteName + '/' + frameName;
        if (this.cacheFrameSizes[cacheKey])
            return this.cacheFrameSizes[cacheKey];

        let frame;
        if (typeof frameName === 'string') {
            frame = this.scene.cache.getFrameByName(spriteName, frameName);
        } else if (typeof frameName === 'number') {
            frame = this.scene.cache.getFrameByIndex(spriteName, frameName);
        } else {
            frame = this.scene.cache.getImage(spriteName);
        }


        if (!frame) throw 'не удалось получить размер для спрайта/кадра "' + cacheKey + '"';

        const currentFrameSize = {
            width: frame.width,
            height: frame.height
        };
        this.cacheFrameSizes[cacheKey] = currentFrameSize;

        return currentFrameSize;
    }



    // определяем универсальные методы управления отображением
    /**
     * Скрыть тайл.
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    hide() {
        this.sprite.visible = false;
        return this;
    }
    /**
     * Показать тайл.
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    show() {
        this.sprite.visible = true;
        return this;
    }
    /**
     * Устанавливает у тайла прозрачность.
     * @param {number} alpha число от 0 (полностью прозрачный) до 1 (полностью непрозрачный)
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setAlpha(alpha) {
        this.sprite.alpha = (typeof alpha === 'number' ? alpha : (this.sprite.alpha || 0));
        return this;
    }
    /**
     * Устанавливает тайлу tint.
     * !!! не может применятся всесте с методами {@link ComponentLayerTile#setHue ComponentLayerTile.setHue()}  и {@link ComponentLayerTile#setIllumination ComponentLayerTile.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint
     * у тайла.
     * @param {number} tint читайте по данному свойству доку фазера.
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setTint(tint) {
        this.sprite.tint = (typeof tint === 'number' ? tint : (this.sprite.tint || 0xFFFFFF));
        return this;
    }
    /**
     * Mеняет окраску слоя в зависимости от hue, а также
     * меняет освещенность слоя в зависимости от illumination
     * !!! не может применятся всесте с методами {@link ComponentLayerTile#setTint ComponentLayerTile.setTint()} и {@link ComponentLayerTile#setIllumination ComponentLayerTile.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} hue число от 0 до 1. (точки цветов: 0.166 - красный, 0.5 - зеленый, 0.833 - синий).
     * Окраска произойдет в зависимости от расстояния hue до точек цветов.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
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
     * !!! не может применятся всесте с методами {@link ComponentLayerTile#setTint ComponentLayerTile.setTint()} и {@link ComponentLayerTile#setHue ComponentLayerTile.setHue()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
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
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setAngle(angle) {
        this.sprite.angle = (typeof angle === 'number' ? angle : (this.sprite.angle || 0));
        return this;
    }
    /**
     * устанавливает для слоя позицию относительно позиции, указанной в конфиге слоя.
     * @param {number} x относительная координата по оси X
     * @param {number} y относительная координата по оси Y
     *
     * @returns {ComponentLayerTile} ссылка на самого себя.
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
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setScale(x, y) {
        x = (typeof x === 'number' ? x : 1);
        y = (typeof y === 'number' ? y : x);
        this.sprite.scale.setTo(this.component.scale.x * this.scale.x * x, this.component.scale.y * this.scale.y * y);
        // this.sprite.scale.setTo(this.scale.x * x, this.scale.y * y);
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
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setOrigin(x, y) {
        this.sprite.anchor.x = (typeof x === 'number' ? x : 0.5);
        this.sprite.anchor.y = (typeof y === 'number' ? y : this.sprite.anchor.x);
        return this;
    }
    /**
     * Устанавливает кадр из текущего (для тайла) атласа по его имени frameName
     * @param {string|number} frameName индекс кадра (число) или имя кадра (строка)
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setFrame(frameName) {
        if (typeof frameName !=='number' && typeof frameName !=='string')
            return this;

        this.frameName = frameName;

        if (typeof frameName === 'number') {
            // console.log(3,frameName);
            this.sprite.frame = frameName;
        } else if (typeof frameName === 'string') {
            // const frame = this.factory.cache.getFrameByName(this.spriteName, frameName);
            // if(frame && frame.index)
            //     this.sprite.frame = frame.index;
  
            const frames = this.factory.frames[this.spriteName];
            if (!frames){
                this.factory.findFramesData(this.spriteName)
                return this;
            }
                
            const index = frames[frameName];
            if (typeof index !== 'number')
                return this;
            this.sprite.frame = index;
            
            // this.sprite.frameName = frameName;
        }else{
            throw "вы пытаетесь установить "+frameName+" у "+this.spriteName;
        }
        // this.sprite.frameName = frameName;
        return this;
    }

    /**
     * Устанавливает количество тайлов по горизонтали и вертикали
     * @param {number} x количество тайлов по оси X
     * @param {number} y количество тайлов по оси Y
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setTiles(x, y) {
        this.tiles.x = (typeof x === 'number' ? x : 0.5);
        this.tiles.y = (typeof y === 'number' ? y : x);
        const frameSize = this.getFrameSize(this.spriteName, this.frameName);
        this.sprite.width = frameSize.width * this.tiles.x;
        this.sprite.height = frameSize.height * this.tiles.y;
        return this;
    }

    /**
     * !!! эта функция может работать некорректно !!!
     * Устанавливает текущий спрайт/картинку/атлас с именем spriteName
     * и кадр из текущего (для спрайта) атласа по его имени frameName
     * @param {string} spriteName имя загруженного спрайта/картинки/атласа
     * @param {string|number} frameName индекс кадра (число) или имя кадра (строка)
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
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

        // получаем размер фрейма/кадра/картинки
        const frameSize = this.getFrameSize(spriteName, frameName);
        // console.log('frameSize',frameSize, this.tiles)

        // создаем спрайт, вносим в него имя слоя и ссылку на слой
        this.sprite = this.scene.add.tileSprite(0, 0, frameSize.width * this.tiles.x, frameSize.height * this.tiles.y, spriteName, frameName);

        this.group.add(this.sprite);
        // this.sprite = this.group.create(0, 0, spriteName, frameName);

        this.sprite.layerName = this.config.layerName;
        this.sprite.myLayer = this;

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
     * Заглушка. У тайла нельзя установить текст. Это можно сделать только у слоя типа text
     * 
     * @returns {ComponentLayerTile} ссылка на самого себя.
     */
    setText() {
        return this;
    }

}

export default ComponentLayerTile;
