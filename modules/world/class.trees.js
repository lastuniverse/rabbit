
class Trees {
    constructor(world){
        this.world = world;
        this.game = world.game;
        this.app = world.game.app;

        // устанавливаем слушатели событий
        if (this.game.once && this.game.on) {
            this.game.once('game.preload', this._preload, this);
            this.game.once('game.create', this._create, this);
            this.game.on('game.update', this._update, this);
        }

        // различные параметры и ограничения мира

        // список объектов
        this.list = [];
    }

    // методы-слушатели событий переключения игровых стадий
    _preload(){
        // загружаем ресурсы
        this.app.loader
            .add('tree1','./images/street_tree.png')
            .add('tree2','./images/tree_2.png');
    }

    _create(){
    }

    _update(delta, multiplier){
        if(!this.world.isStarted) return;
        this.list = this.list.filter(item=>{
            item.x -= this.world.speed*multiplier;
            if(item.x+item.width>0) return true;
            item.destroy();
            return false;
        });        
    }

    reset() {
        this.list.forEach(item => {
            item.destroy();
        });
        this.list = [];
    }    

    newTree(){
        const type = Math.ceil(Math.random()*2);
        const stopper = this.game._getSprite('tree'+type);
        stopper.scale.set(0.5+Math.random());
        stopper.anchor.x = 0;
        stopper.anchor.y = 1;
        stopper.x = this.world.length;
        stopper.y = 3;

        

        this.list.push(stopper);
        this.world.backgroundGroup.addChild(stopper);
    }
} 


export default Trees;