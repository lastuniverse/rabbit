class Rabbit {
    constructor(world) {
        this.world = world;
        this.game = world.game;
        this.app = world.app;
        this.factory = world.game.factory;
        this.group = world.group || this.app.stage;


        // устанавливаем слушатели событий
        if (this.game.once && this.game.on) {
            this.game.once('game.preload', this._preload, this);
            this.game.once('game.create', this._create, this);
            this.game.on('game.update', this._update, this);
        }

        // различные параметры и ограничения мира
        this.force = 0;
    }

    // методы-слушатели событий переключения игровых стадий
    _preload() {
        // загружаем конфиги компонентов
        // this.factory
        //     .add('rabbit.js');

    }

    _create() {

        this.rabbit = this.factory.getComponent('RABBIT')
            .setPosition(450, 0)
            .addToGroup(this.group)
            .play('normal');

            
    }

    _update(delta, multiplier) {
        if (!this.world.isStarted) return;
        if (this.force > 0) {
            this.rabbit.group.y -= this.force * multiplier;
            this.force -= multiplier;
            this.force = this.force < 0 ? 0 : this.force;
        } else if (this.force < 0) {
            this.rabbit.group.y -= this.force * multiplier;
        } else {
            const dy = 300 / (this.rabbit.group.y < -1 ? -this.rabbit.group.y : 1);
            this.rabbit.group.y += dy;
        }

        if (this.rabbit.group.y > 0) {
            this.rabbit.play('normal', true);
            this.force = 0;
            this.rabbit.group.y = 0;
        }
    }

    jump() {
        if (this.rabbit.group.y < 0) {
            this.rabbit.play('normal', true);
            this.force = -12;
        } else {
            this.force = 16;
            this.rabbit.play('fly', true);
        }


    }
    reset(){
        this.rabbit.group.y = 0;
        this.rabbit.play('normal', true);
    }
}


export default Rabbit;