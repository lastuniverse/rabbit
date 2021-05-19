import ReRandom from '../utils/class.rerandom.js'
import Rabbit from './class.rabbit.js'
import Stoppers from './class.stoppers.js'
import Trees from './class.trees.js'

class World {
    constructor(game){
        this.game = game;
        this.app = game.app;

        // создаем объект класса ReRandom с ГПСЧ 
        // (генератором псевдослучайных последовательностей)
        // инициализируя его случайным seed-ом
        // this.PRNG = new ReRandom(Math.floor(Math.random()*65535))
        this.PRNG = new ReRandom(0);

        // устанавливаем слушатели событий
        if (this.game.once && this.game.on) {
            this.game.once('game.preload', this._preload, this);
            this.game.once('game.create', this._create, this);
            this.game.on('game.update', this._update, this);
        }

        // контейнер для неба
        this.skyGroup = new PIXI.Container();
        this.app.stage.addChild(this.skyGroup);

        // контейнер для элементов мира
        this.group = new PIXI.Container();
        this.app.stage.addChild(this.group);

        // контейнер для фоновых элементов мира
        this.backgroundGroup = new PIXI.Container();
        this.group.addChild(this.backgroundGroup);
        

        // подключаем фабрику препятсвий
        this.stoppers = new Stoppers(this);

        // подключаем фабрику деревьев
        this.trees = new Trees(this);
        

        // подключаем кролика
        this.rabbit = new Rabbit(this);


        // различные параметры и ограничения мира
        this.minSpeed = 0;
        this.maxSpeed = 16;

        this.minAngle = 0;
        this.maxAngle = 8;

        this.position=0;

        this.count = 0;

        // инициализируем мир
        this.reset()

    }

    // методы-слушатели событий переключения игровых стадий
    _preload(){
        // загружаем ресурсы
        this.app.loader
            .add('sky','./images/sky.jpeg')
            .add('floor','./images/floor.png');
    }
    _create(){

        // добавляем спуск
        this.floor = this.game._getTillingSprite('floor', 0, 2*Math.hypot(this.app.screen.height, this.app.screen.width), 414);
        // this.floor = this.game._getSprite('floor', 0);
        this.floor.scale.set(0.5,1.0);
        // this.floor.anchor.x = 0;
        // this.floor.anchor.y = 0;
        this.floor.x = 0;
        this.floor.y = 0;
        this.floor.tilePosition.x = 0;
        this.floor.tilePosition.y = -1;
        this.group.addChild(this.floor);

        // добавляем небо (с эффектом паралакса)
        this.sky = this.game._getTillingSprite('sky', 0, this.app.screen.width, this.app.screen.height);
        this.sky.x = 0;
        this.sky.y = 0;
        this.sky.tilePosition.x = 0;
        this.sky.tilePosition.y = 0;
        this.sky.scale.set(this.app.screen.width/1005);
        this.skyGroup.addChild(this.sky);

        

        // добавляем тап по экрану
        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', ()=>{
            if(this.isActive) this.start();
        });
    
        // если открыта одна из форм блокируем управление кроликом
        this.game.on('ui.open.*',()=>{
            this.isActive = false;
        });        
        

    }
    _update(delta, multiplier){
        if(!this.isStarted) return;

        // вычисляем позиции тайлов неба и спуска
        this.position -= this.speed*multiplier*2;
        this.floor.tilePosition.x = this.position;
        this.sky.tilePosition.x -= this.speed*multiplier/20;
        
        // добавляем деревья (случайно)
        const count = Math.floor(this.position/200);
        if (this.count !== count){
            const random = Math.random();
            if(random>0.34){
                this.trees.newTree();
            }
        } 
        this.count = count;

        // простенький подсчет дистанции и очков
        this.rounddata.distance = Math.abs(Math.floor(this.position/150));
        this.rounddata.score = this.rounddata.distance+this.rounddata.stoppers*2;
    }

    setSpeed(speed){
        // вычисляем угол наклона в зависимости от скорости
        // при speed == this.maxSpeed угол будет angle == this.maxAngle

        this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
        this.angle = (Math.asin(this.speed/this.maxSpeed)*180/Math.PI)*this.maxAngle/90;
        this.group.angle = this.angle;

        // в зависимости от угла наклона вычисляем:
        
        // разницу по высоте между видимыми точками спуска слева и справа
        const height = this.app.screen.width * Math.sin(this.angle*Math.PI/180);
        // видимую длину поверхности тайла со спуском
        this.length = Math.hypot(this.app.screen.width,height);

        //  выставляем группу так, чтобы справа до нижнего края экрана всегда было 50 точек
        this.group.y = this.app.screen.height - height - 50;    
    }

    reset(){
        // обнуляем данные мира перед новым туром игры
        this.position = 0;    
        if(this?.floor ) this.floor.tilePosition.x = this.position;
        this.setSpeed(16);

        if (this.isBreak){
            this.stoppers.reset();
            this.trees.reset();
            this.rabbit.reset();
        }

        
        // обнуляем данные о прохождении игроком предыдущего тура игры
        this.rounddata = {
            stoppers: 0,
            money: 0,
            distance: 0,
            score: 0
        };        

        // выставляем необходимые флаги
        this.isStarted = false;
        this.isBreak = false;
        this.isActive = true;

        // устанавливаем реакции на события клавиатуры
        this.game.keyboard.setListeners({
            'SPACE': this.start.bind(this),
            'ESCAPE': this.stop.bind(this),
        }, this);
    }

    start(){
        // запускаем игру (прыгаем если уже запущена)
        if(this.isStarted){
            this.rabbit.jump();
        }

        this.isStarted = true;
    }
    
    stop(){
        // приостанавливаем игру
        this.isStarted = false;
    }

    break(){
        // завершаем игровой тур (врезались)
        this.isStarted = false;
        this.isBreak = true;
        this.game.emit('ui.close');
        this.game.emit('ui.open.youscore', this.rounddata);   
    }    

    
} 




export default World;