import AnimationsWrapper from './class.animations.wrapper.js'
import AnimationsProcessor from './class.animations.processor.js'

/**
 * Данный класс играет роль менеджера анимаций и посредника между ними и объектами. 
 * Работает по следующему принципу:
 * 1. с помощью метода {@link AnimationsManager#addAnimator AnimationsManager.addAnimator()} подключаем функции-аниматоры, передавая их конструктору 
 * класса {@link AnimationsProcessor} и запоминая результирующий объект в сdойстве `this.animators = []`
 * 2. с помощью метода {@link AnimationsManager#addPreset AnimationsManager.addPreset()} подключаем массивы с управляющими данными (пресет анимаций), 
 * и запоминая их в сdойстве `this.presets = {}`
 * 3. с помощью метода {@link AnimationsManager#addTargets AnimationsManager.addTargets()} подключаем управляемыне объекты, передавая 
 * их конструктору класса {@link AnimationsWrapper} и запоминая результирующий объект в 
 * сdойстве `this.targets = []`
 * 4. далее, при вызове метода {@link AnimationsManager#play AnimationsManager.play('имя пресета анимаций')} у всех объектов из свойства
 * `this.targets = []`, являющихся объектами класса {@link AnimationsWrapper} запускает метод
 * {@link AnimationsWrapper#play AnimationsWrapper.play('имя пресета анимаций')}, в результате чего данные объекты попадут в свойство
 * `this.processed = [];`;
 * 5. Для всех объекты из свойства `this.processed = [];` при каждом вызове метода {@link AnimationsManager#update AnimationsManager.update()}
 * будут запущены функции-аниматоры указанные в выбраном для проигрывания персете анимаций. 
 * Данным функциям при каждом вызове {@link AnimationsManager#update AnimationsManager.update()} передаются следующие параметры:
 * - число от 0 до 1 означающее текущее состояние прогреса анимации;
 * - управляемый объект;
 * - параметры используемого пресета анимаций.
 * На основании этих параметров функция аниматор должна вносить необходимые изменения в управляемом объекте.
 */
class AnimationsManager {
    /**
     * @constructor
     * @param {Phaser.scene} scene ссылка на сцену (игру)
     */
    constructor(scene) {
        // свойства
        this.scene = scene;
        this.animators = {};
        this.presets = {};
        this.processed = [];
        this.targets = [];
        this.timer = 0;
    }
    /**
     * Метод добавляет новый объект класса {@link AnimationsProcessor AnimationsProcessor} в список анимаций под именем processorName
     * @param {string} processorName  произвольное наименование данной анимации
     * @param {Function|Array|AnimationsProcessor} animator объект класса {@link AnimationsProcessor AnimationsProcessor} либо массив выходных значений либо функция-аниматор
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    addAnimator(processorName, animator) {
        if (typeof processorName !== 'string')
            throw 'processorName должен быть строкой';
        if (!Array.isArray(animator) &&
            typeof animator !== 'function' &&
            !(animator instanceof AnimationsProcessor))
            throw 'animator должен быть функцией одного аргумента, массивом или объектом класса AnimationsProcessor';

        this.animators[processorName] = (animator instanceof AnimationsProcessor ? animator : new AnimationsProcessor(animator));
        return this;
    }
    /**
     * Метод удаляет из списка анимаций объект класса {@link AnimationsProcessor AnimationsProcessor} под именем processorName
     * @param {string} processorName
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    removeAnimator(processorName) {
        if (typeof processorName !== 'string')
            throw 'processorName должен быть строкой';
        delete this.animators[processorName];
        return this;
    }
    /**
     * Метод создает именованный набор анимаций с именем presetName
     * @param {string} presetName имя нбора анимаций
     * @param {Array<object>} animations массив объектов содержащих параметры анимации
     * @param {string} animations.name наименование аниматора ({@link AnimationsProcessor})
     * @param {string} animations.value модифицируемое свойство целевого объекта
     * @param {number} animations.time продолжительность анимации (мс)
     * @param {number} animations.loop количество циклов анимации
     * @param {float} animations.multipler коэффициент умножения текущего значения, выдаваемого аниматором
     * @param {boolean} animations.reverse если true то анимация будет происходить в обратном порядке
     * @param {boolean} animations.intetpolate если true то будет происходить плавное изменение между ключами (только для аниматоров, инициализируемых массивом значений)
     * @param {boolean} animations.yoyo если true то в течении каждого цикла анимация будет производиться по принципу туда-обратно
     * @param {string} animations.mode если 'add' то на каждой итерации значение будет добавлятся, иначе присваиваться
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    addPreset(presetName, animations) {
        if (!Array.isArray(animations))
            animations = [animations];

        this.presets[presetName] = animations;
        return this;
    }
    /**
     * Метод удаляет именованный набор анимаций с именем presetName
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    removePreset(presetName) {
        if (typeof presetName !== 'string')
            throw 'presetName должен быть строкой';
        delete this.presets[presetName];
        return this;
    }
    /**
     * метод добавляет целевые объекты в список управляемых
     * @param {Array<object>} targetObject целевой(управляемый) объект или массив таких объектов
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    addTargets(targetObject) {
        if (typeof targetObject !== 'object')
            throw 'targetObject должен быть объектом или массивом объектов';

        if (targetObject instanceof AnimationsWrapper) {
            const isExists = (this.targets.indexOf(targetObject) >= 0);
            if (isExists)
                return;

            this.targets.push(targetObject);

        } else {
            if (!Array.isArray(targetObject))
                targetObject = [targetObject];

            // AnimationsWrapper сам добавит себя в this.targets
            new AnimationsWrapper(targetObject, this);
        }
        return this;
    }
    /**
     * метод удаляет объекты из списка управляемых. Если в качестве аргумента был передан объект класса {@link AnimationsWrapper AnimationsWrapper}
     * то будет удален (безвозвратно) из списка управляемых. Если в качестве аргумента был передан управляемый объект или массив обхектов, то из всех
     * зарегестрированных враперов будут удалены эти объекты, то есть при следующем
     * запуске анимации данные объекты не будут добавленны в обработку но текущую анимацию это не затронет.
     * @param {object|Array<object>|AnimationsWrapper|Array<AnimationsWrapper>} targetObject управляемый объект или объект класса {@link AnimationsWrapper AnimationsWrapper} или массив таких объектов
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    removeTargets(targetObject) {
        if (typeof targetObject !== 'object')
            throw 'targetObject должен быть объектом или массивом объектов';

        if (Array.isArray(targetObject))
            return targetObject.forEach(function (object) {
                this.removeTargets(object);
            }, this);

        if (targetObject instanceof AnimationsWrapper) {
            const index = this.targets.indexOf(targetObject);
            if (index < 0)
                return;
            this.targets.splice(index, 1);
            this.removeProcessed(targetObject);
        } else {
            this.targets.slice(0).forEach(function (wrapper) {
                wrapper.removeTargets(targetObject);
                if(!!wrapper.targets.length){
                    wrapper.destroy();
                } 
            }, this);
        }

        return this;
    }
    /**
     * метод удаляет AnimationsManager и все зарегестрированные объекты класса {@link AnimationsWrapper AnimationsWrapper}
     */
    destroy(targetObject) {
        this.isDestroy = true;
        this.targets.forEach(function (wrapper) {
            wrapper.destroy();
        }, this);
        this.animators = {};
        this.presets = {};
        this.processed = [];
        this.targets = [];

        return this;
    }
    /**
     * метод добавляет объекты в список анимируемых
     * @param {AnimationsWrapper|Array<AnimationsWrapper>} targetObject объект класса {@link AnimationsWrapper AnimationsWrapper} или массив таких объектов
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    addProcessed(targetObject) {
        if (typeof targetObject !== 'object')
            throw 'targetObject должен быть объектом или массивом объектов';

        if (!Array.isArray(targetObject))
            targetObject = [targetObject];
        targetObject.forEach(function (object) {
            if (!(object instanceof AnimationsWrapper))
                return;

            const isExists = (this.processed.indexOf(object) >= 0);
            if (isExists)
                return;

            this.processed.push(object);


        }, this);
        return this;
    }
    /**
     * метод удаляет объекты из списка анимируемых, но при следующем
     * запуске привязанных к ним анимаций они будут добавленны в обработку.
     * @param {AnimationsWrapper|Array<AnimationsWrapper>} targetObject объект класса {@link AnimationsWrapper AnimationsWrapper} или массив таких объектов
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    removeProcessed(targetObject) {
        if (typeof targetObject !== 'object')
            throw 'targetObject должен быть объектом или массивом объектов';

        if (Array.isArray(targetObject))
            return targetObject.forEach(function (object) {
                this.removeProcessed(object);
            });

        if (!(targetObject instanceof AnimationsWrapper))
            return;

        const index = this.processed.indexOf(targetObject);
        if (index < 0)
            return;

        this.processed.splice(index, 1);

        return this;
    }
    /**
     * метод обновляет все зарегестрированные объекты согласно примененным к ним наборам анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    update(delta) {
        if (this.isDestroy)
            return;
        this.timer += delta;

        this.processed.forEach(wrapper => {
            if (wrapper instanceof AnimationsWrapper) {
                wrapper.update();
            }
        });
        return this;
    }
    /**
     * запустить/продолжить именованный набор анимаций для всех объектов к которым данный набор подключен
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    play(presetName) {
        this.targets.forEach(function (wrapper) {
            wrapper.play(presetName);
        }, this);
        return this;
    }
    /**
     * остановить именованный набор анимаций для всех объектов к которым данный набор подключен
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    stop(presetName) {
        this.targets.forEach(function (wrapper) {
            wrapper.stop(presetName);
        }, this);
        return this;
    }
    /**
     * приостановить именованный набор анимаций для всех объектов к которым данный набор подключен
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    pause(presetName) {
        this.targets.forEach(function (wrapper) {
            wrapper.pause(presetName);
        }, this);
        return this;
    }
    /**
     * возобновить именованный набор анимаций для всех объектов к которым данный набор подключен
     * @param {string} presetName имя нбора анимаций
     * @return {AnimationsManager} возращает указатель на самого себя
     */
    resume(presetName) {
        this.targets.forEach(function (wrapper) {
            wrapper.resume(presetName);
        }, this);
        return this;
    }
}
export default AnimationsManager;

window.AnimationsManager = AnimationsManager;

