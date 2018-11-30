class Level extends GameObject {
    static preload() {
        // Level.sprite = loadImage('level.png');
        Level.level1 = loadJSON('level1.json');
    }

    constructor() {
        super(Level.sprite);
        this.data = Level.level1;
    }

    draw() {
        fill('black');
        noStroke();
        for (let plat of this.data.platforms) {
            rect(plat.x, plat.y, plat.w, plat.h);
        }
    }
}
