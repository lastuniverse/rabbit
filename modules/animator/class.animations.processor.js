/**
 * Данный класс предназначен для автоматизации управления процессом преобразования величин.
 * Для этих целей используется функция-аниматор, которая принимет в качестве параметра 
 * числовое значение в диапазоне [0:1] и на его основе вычисляет результирующее значение,
 * которое затем присваивает целевому свойству в управляемом объекте. Непосредственно 
 * генерацией входных значений занимаетися объект класса {@link AnimationsWrapper}.
 * Непосредственно присвоением результата к свойству управляемого объекта занимается
 * функция-аниматор.
 */
class AnimationsProcessor {
    /**
     * @constructor
     * @param {function|Array} animator - функция - аниматор
     */
    constructor(animator) {
        this.isDisable = false;
        this.setAnimator(animator);
    }

    /**
     * метод устанавливает функцию-аниматор в список анимаций. Функция-аниматор это такая функция,
     * которая принимет в качестве параметра 
     * числовое значение в диапазоне [0:1] и на его основе вычисляет результирующее значение,
     * которое затем присваивает целевому свойству в управляемом объекте. Непосредственно 
     * генерацией входных значений занимаетися объект класса {@link AnimationsWrapper}.
     * Непосредственно присвоением результата к свойству управляемого объекта занимается
     * функция-аниматор.
     * @param {function|Array} animator - массив выходных значений либо функция-аниматор
     * @return {AnimationsProcessor} возращает указатель на самого себя
     */
    setAnimator(animator) {
        if (Array.isArray(animator)) {
            this.animator = function (input, object, params) {
                if (params.intetpolate) {
                    //     const position = (input * animator.length) % animator.length;
                    //     let index1 = Math.floor(position);
                    //     let index2 = ((position < index1 ? index1 - 1 : index1 + 1) + animator.length) % animator.length;
                    //     const output = animator[index1] + (animator[index1] - animator[index2]) * (index1 - position);
                    //     return output
                    const l = animator.length - 1;
                    const temp = (input * l);
                    const position = temp - Math.floor(temp / l) * l;
                    let index1 = Math.floor(position);
                    let index2 = index1 + 1;
                    if (index2 >= animator.length)
                        index2 = animator.length - 1;
                    const output = animator[index1] + (animator[index1] - animator[index2]) * (index1 - position);
                    return output;
                } else {
                    return animator[Math.floor(input * (animator.length + 1))];
                }

            };
        } else if (typeof animator === 'function') {
            this.animator = animator;
        } else {
            this.animator = function (input) {
                return input;
            };
        }
        return this;
    }
    /**
     * метод возвращает значение из/от this.animator для следующего шага итерации.
     * В качестве преобразователя используется функция-аниматор устанавливаемая методом {@link AnimationsProcessor#setAnimator AnimationsProcessor.setAnimator()}
     * В качестве пользователя данного метода выступают объекты класса {@link AnimationsWrapper}
     * @param {number} input
     * @param {object} object
     * @param {object} options
     * @return {any} возвращает текущее значение для анимации
     */
    next(input, object, options, playOptions) {
        if (this.isDisable)
            return;
        return this.animator(input, object, options, playOptions);
    }
    /**
     * метод отключает аниматор
     */
    disable() {
        this.isDisable = true;
    }
    /**
     * метод включает аниматор
     */
    enable() {
        this.isDisable = false;
    }
}
export default AnimationsProcessor;

window.AnimationsProcessor = AnimationsProcessor;