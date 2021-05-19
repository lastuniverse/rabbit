/**
 * вспомогательная для ComponentView.prototype.setHue
 * @param {number} input координата на окружности длинна которой равна 1
 * @param {number} point координата точки на окружности до которой считаем расстояние
 * @param {number} offset задает интервал преобразованного выходного значения (от offset до 255)
 */
export function getColorPower(input, point, offset) {
    const sign = (input < point ? 1 : -1);
    const dist = Math.min(Math.abs(input - point), Math.abs(input - point + sign));
    const power = offset + (1 - offset) * (1 - dist / 0.5);
    return Math.floor(255 * power);
}


/**
 * Первая буква прописная остальные строчные.
 * @param {string} text произвольный текст
 */
export function capitalize(text){
    if (typeof text !== 'string') return ''
    text = text.toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
}


 
