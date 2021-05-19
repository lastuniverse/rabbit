
class Stoppers {
    constructor(world) {
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
    _preload() {
        // загружаем ресурсы
        this.app.loader
            .add('stopper', './images/stopper_idle.png');
    }

    _create() {
        this.reset();
    }

    _update(delta, multiplier) {
        // console.log(this.world.rabbit.rabbit.group)
        if (!this.world.isStarted) return;
        let hasAddStopper = false;
        this.list = this.list.filter(item => {
            item.oldX = item.x;
            item.x -= this.world.speed * multiplier;

            if (item.x < this.world.length && item.oldX >= this.world.length) {
                hasAddStopper = true;
            }


            if (item.x + item.width <= 0) {
                this.world.rounddata.stoppers++;
                item.destroy();
                return false;

            }

            if (this.testCollisions(item)) {
                this.world.break();
                // this.world.stop();
            }

            return true;
        });



        if (hasAddStopper) this.newStopper();

    }

    reset() {
        this.list.forEach(item => {
            item.destroy();
        });
        this.list = [];
        this.newStopper();
    }

    newStopper() {
        const stopper = this.game._getSprite('stopper',);
        stopper.scale.set(0.5)
        stopper.anchor.x = 0.5;
        stopper.anchor.y = 1;
        stopper.x = this.world.length + this.world.length / 2 + Math.random() * 2 * this.world.length;
        stopper.y = 5;



        this.list.push(stopper);
        this.world.group.addChild(stopper);
    }

    testCollisions(item) {
        const rabbit = this.world.rabbit.rabbit.group
        if (Math.abs(item.x - rabbit.x) > item.width * 0.8) return false;
        if (rabbit.y < item.y - item.height * 0.8) return false;
        return true;
    }
}


export default Stoppers;