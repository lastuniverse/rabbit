/**
 * Класс конфигураций. Применяется для сокращения количества глобальных переменных
 * при подключении различных конфигураций (например конфигураций многослойных компонентов).
 * При подключении в глобальном пространстве имен будет создан объект данного класса Сonfigurations
 * `if(!window.configurations) window.configurations = new Configurations();`
 */
class RegConfigurations{
    /**
     * @constructor
     */
    constructor(){
        this.list = [];
    }
    /**
     * Заменяет конфигурацию с именем `config.name` во внутреннем хранилище загруженных конфигураций на переданную конфигурацию.
     * @param {object} config 
     */
     replace(config){
        if(typeof config !== 'object' || Array.isArray(config)) throw 'Конфигурация должна быть объектом';

        if(typeof config.name !== 'string' || !config.name) throw 'Объект с конфигурацией должен содержать свойство name';

        let index;
        this.list.some(function(item, i) {
            if(item.name!==config.name) return false;
            index = i;
            return true;
        }, this);
        if(index!== undefined){
            this.list.splice(index,1);
        }


        this.list.push(config);
    }
    /**
     * Удаляет переданную конфигурацию из внутреннего хранилища загруженных конфигураций.
     * @param {object} config 
     */
     remove(config){
        if(typeof config !== 'object' || Array.isArray(config)) throw 'Конфигурация должна быть объектом';

        if(typeof config.name !== 'string' || !config.name) throw 'Объект с конфигурацией должен содержать свойство name';

        let index;
        this.list.some(function(item, i) {
            if(item.name!==config.name) return false;
            index = i;
            return true;
        }, this);
        if(index!== undefined){
            this.list.splice(index,1);
        }

        // if(this.getConfigByName(config.name)) throw 'Конфигурация для "'+config.name+'" уже подключена, перепроверьте ваши данные';

        this.list.push(config);
    }

    /**
     * Удаляет переданную конфигурацию из внутреннего хранилища загруженных конфигураций.
     * @param {object} config 
     */
     removeByName(configName){
        if(typeof configName !== 'string' || !configName) return;

        let index;
        this.list.some(function(item, i) {
            if(item.name!==configName) return false;
            index = i;
            return true;
        }, this);
        if(index!== undefined){
            this.list.splice(index,1);
        }

        // if(this.getConfigByName(config.name)) throw 'Конфигурация для "'+config.name+'" уже подключена, перепроверьте ваши данные';
    }    
    /**
     * Добавляет объект с конфигурацией во внутреннее хранилище. Объект должен иметь свойство
     * name типа string содержащее наименование подключаемой конфигурации. Попытка загрузить
     * несколько конфигураций с одинаковыми именами вызовет ошибку.
     * @param {object} config объект, содержащий конфигурационные данные
     */
    add(config){
        if(typeof config !== 'object' || Array.isArray(config)) throw 'Конфигурация должна быть объектом';

        if(typeof config.name !== 'string' || !config.name) throw 'Объект с конфигурацией должен содержать свойство name';

        if(this.getConfigByName(config.name)) throw 'Конфигурация для "'+config.name+'" уже подключена, перепроверьте ваши данные';

        this.list.push(config);
    }
    /**
     * Производит поиск объекта с конфигурационными данными с наименованием name во
     * внутреннем хранилище и возвращает его.
     * @param {string} name наименование запрашиваемой конфигурации
     * 
     * @returns {object} объект с конфигурационными данными или null если объекта с именем name не найдено.
     */
    getConfigByName(name){
        if(!name) return null;
        return this.list.find(function(item) {
            return item.name===name;
        }, this);
    }

    /**
     * Производит поиск во внутреннем хранилище всех объектов с конфигурационными данными имеющих свойство
     * type равное typeName
     * @param {string} typeName наименование запрашиваемого типа конфигураций
     * 
     * @returns {array} массив с найденными объектами конфигурационных данных.
     */ 
    getConfigByType(typeName){
        if(!typeName) return [];
        return this.list.filter(function(item) {
            return item.type===typeName;
        }, this);
    }
    /**
     * Производит поиск во внутреннем хранилище всех объектов с конфигурационными данными имеющих свойство
     * group равное groupName
     * @param {string} groupName наименование запрашиваемой группы конфигураций
     * 
     * @returns {array} массив с найденными объектами конфигурационных данных.
     */    
    getConfigByGroupName(groupName){
        if(!groupName) return [];
        return this.list.filter(function(item) {
            return item.group===groupName;
        }, this);
    }
    /**
     * Производит поиск во внутреннем хранилище всех объектов с конфигурационными данными имеющих:
     * свойство type равное typeName
     * и свойство group равное groupName
     * @param {string} typeName наименование запрашиваемого типа конфигураций
     * @param {string} groupName наименование запрашиваемой группы конфигураций
     * 
     * @returns {array} массив с найденными объектами конфигурационных данных.
     */    
    getConfigByTypeAndGroupName(typeName, groupName){
        if(!typeName) return [];
        if(!groupName) return [];
        return this.list.filter(function(item) {
            return (item.group===groupName && item.type===typeName);
        }, this);
    }
}
export default RegConfigurations;


if(!window.configurations){
    /**
     * @global
     * @property {RegConfigurations} window.configurations содержит объект типа {@link RegConfigurations}
     */    
    window.configurations = new RegConfigurations();

}
