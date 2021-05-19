import AnimationsWrapper from '../animator/class.animations.wrapper.js'
import { getColorPower, capitalize } from './utils.js'

/**
 * Класс слоя для компонента. В качестве слоя использует дочерний компонент.
 */
class ComponentLayerComponent {

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



        this.animations = config.animations; // запоминаем ключи анимаций
        this.layerName = config.layerName; // устанавливаем имя слоя из конфига
        this.layerType = 'component';


        // устанавливаем компонент указанный в конфиге слоя
        this.subcomponent = this.factory.getComponent(config.componentName);
        this.group.addChild(this.subcomponent.group);
        // this.subcomponent.group.add(this.group);

        // выставляем начальные параметры спрайта слоя
        this
            .setScale(1, 1) // установит с учетом scale указанных в конфиге компонента и слоя
            .setAngle(config.angle)
            .setAlpha(config.alpha)
            .setPosition(0, 0) // установит с учетом позиции указанной в конфиге слоя
            .hide();


        // ну и главное, анимационная обертка спрайта))))
        this.wrapper = new AnimationsWrapper(this, this.manager);
    }

    /**
     * Останавливает для слоя все анимации и вызывает destroy() у вложенного компонента.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    destroy() {
        this.wrapper.destroy();
        const index = this.component.layers.indexOf(this);
        if (index >= 0) {
            this.component.layers.splice(index, 1);
        }
        this.group.remove(this.subcomponent.group);
        this.subcomponent.destroy();
        return this;
    }

    

    /**
     * Запускает отрисовку отрисовку слоя с назначенной ему анимацией. Ообенность данного
     * слоя заключена в том, что он так же вызовет метод {@link ComponentLayerComponent#play ComponentLayerComponent.play()} с теми же параметрами у 
     * вложенного в слой компонента. Внимательно следите чтобы у вложенного компонента совпадали
     * наименования проигрываемых комбинаций с родительским компонентом, иначе анимации вложенного 
     * компонента запущены не будут.
     * @param {string} compositionName имя комбинации.
     * @param {object} options объект с доп параметрами, передаваемыми четвертым аргументом
     * в аниматоры, объявленные в конфиге компонента. если объект задан то options
     * в аниматорах будет обновлен.
     * @param {boolean} isStop если true то принудительно останавливает уже играющие анимации.
     * анимации по времени или методами {@link ComponentLayerComponent#stop ComponentLayerComponent.stop()} и {@link ComponentView#stop ComponentView.stop()}.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    
    play(compositionName, options, isStop) {
        // this.subcomponent.play(compositionName, options, isStop);
        const layerPreset = this.animations[compositionName];
        // const isSubCompositionName = this.subcomponent.config.compositions[compositionName];
        // console.log(compositionName, isSubCompositionName);
        // if (true === isStop || !isSubCompositionName) {
        //     this.subcomponent.stop();
        //     this.subcomponent.hide();
        // }
        
        if (true === isStop) {
            this.stop();
            this.hide();
        }
        if (layerPreset) {
            this.wrapper.play(layerPreset, options, isStop);
            // this.subcomponent.play(compositionName, options, isStop);
            this.show();
        }else{
            this.stop(compositionName);
            this.hide();
        }
        return this;
    }

    /**
     * Останавливает анимацию слоя. Так же будет остановлена анимация у вложенного компонента.
     * @param {string} compositionName название именованной комбинации слоев
     * из которой будет взято название пресета останавливаемой анимации.
     * Если не задано то будут остановленны все текущие анимации слоя.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    stop(compositionName) {
        const layerPreset = this.animations[compositionName];
        this.wrapper.stop(layerPreset);
        // this.subcomponent.stop(compositionName);
        return this;
    }

    // определяем универсальные методы управления отображением
    /**
     * Скрыть вложенный компонент.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    hide() {
        this.subcomponent.hide();
        // this.group.visible = false;
        return this;
    }
    /**
     * Показать вложенный компонент.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    show() {
        this.subcomponent.show();
        // this.group.visible = true;
        return this;
    }
    /**
     * Устанавливает прозрачность у группы встроенного компонента.
     * @param {number} alpha число от 0 (полностью прозрачный) до 1 (полностью непрозрачный)
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setAlpha(alpha) {
        this.subcomponent.setAlpha(alpha);
        return this;
    }
    /**
     * Устанавливает группе вложенного компонента tint.
     * !!! не может применятся всесте с методами {@link ComponentLayerComponent#setHue ComponentLayerComponent.setHue()} и {@link ComponentLayerComponent#setIllumination ComponentLayerComponent.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint
     * у группы вложенного компонента.
     * @param {number} tint читайте по данному свойству доку фазера.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setTint(tint) {
        this.subcomponent.setTint(tint);
        return this;
    }
    /**
     * Mеняет окраску слоя в зависимости от hue, а также
     * меняет освещенность слоя в зависимости от illumination
     * !!! не может применятся всесте с методами {@link ComponentLayerComponent#setTint ComponentLayerComponent.setTint()} и {@link ComponentLayerComponent#setIllumination ComponentLayerComponent.setIllumination()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} hue число от 0 до 1. (точки цветов: 0.166 - красный, 0.5 - зеленый, 0.833 - синий).
     * Окраска произойдет в зависимости от расстояния hue до точек цветов.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setHue(hue, illumination) {
        this.subcomponent.setHue(hue, illumination);
        return this;
    }
    /**
     * Меняет освещенность слоя в зависимости от illumination.
     * !!! не может применятся всесте с методами {@link ComponentLayerComponent#setTint ComponentLayerComponent.setTint()} и {@link ComponentLayerComponent#setHue ComponentLayerComponent.setHue()},
     * так как все три метода работают путем устанавки свойства tint.
     * @param {number} illumination число от 0 (черный) до 1 (оригинальный).
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setIllumination(illumination) {
        this.subcomponent.setIllumination(illumination);
        return this;
    }
    /**
     * Устанавливает для слоя угол (относительный) вращения слоя (вокруг origin слоя).
     * @param {number} angle угол поворота слоя внутри группы родительского компонента.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setAngle(angle) {
        this.subcomponent.setAngle(angle);
        return this;
    }
    /**
     * устанавливает для слоя режим смешивания/наложения
     * @param {string} mode режим смешивания/наложения
     * 
     * @returns {ComponentLayerSprite} ссылка на самого себя.
     */
     setBlendMode(mode) {
        this.subcomponent.setBlendMode(mode);
        return this;
    }    
    /**
     * устанавливает для слоя позицию относительно позиции, указанной в конфиге слоя.
     * @param {number} x относительная координата по оси X
     * @param {number} y относительная координата по оси Y
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setPosition(x, y) {
        x = this.position.x + (typeof x === 'number' ? x : (this.sprite.x || 0));
        y = this.position.y + (typeof y === 'number' ? y : (this.sprite.y || 0));
        this.subcomponent.setPosition(x, y);
        return this;
    }
    /**
     * устанавливает для слоя масштабирование относительно масштаба, указанного в конфиге слоя
     * @param {number} x относительный масштаб по оси X
     * @param {number} y относительный масштаб по оси Y
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setScale(x, y) {
        x = (typeof x === 'number' ? x : 1);
        y = (typeof y === 'number' ? y : x);
        // this.sprite.scale.setTo(this.component.scale.x * this.scale.x * x, this.component.scale.y * this.scale.y * y);        
        this.subcomponent.setScale(this.component.scale.x * this.scale.x * x, this.component.scale.y * this.scale.y * y);
        // this.subcomponent.setScale(this.scale.x * x, this.scale.y * y);
        return this;
    }
    /**
     * Заглушка. основа компонента это группа.В Phaser-е у групп отсутствует origin.
     * Для позиционирования слоя исползуйте вместо метода {@link ComponentLayerComponent#setOrigin ComponentLayerComponent.setOrigin()} метод {@link ComponentLayerComponent#setPosition ComponentLayerComponent.setPosition()}
     * который позиционирует дочерний компонент относительно координат редительского
     * компонента.
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setOrigin(x, y) {
        return this;
    }
    /**
     * Заглушка. У группы вложенного компонента нельза установить тайлы. Это можно сделать только у слоя типа tile
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setTiles(x, y) {
        return this;
    }
    /**
     * Заглушка. У группы вложенного компонентанельзя установить frame. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setFrame() {
        return this;
    }
    /**
     * Заглушка. У группы вложенного компонента нельзя установить текстуру. Это можно сделать только у слоя типа tile или sprite
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setTexture() {
        return this;
    }
    /**
     * заглушка. У группы вложенного компонента нельзя установить текст. Это можно сделать только у слоя типа text
     * 
     * @returns {ComponentLayerComponent} ссылка на самого себя.
     */
    setText() {
        return this;
    }

}

export default ComponentLayerComponent;
