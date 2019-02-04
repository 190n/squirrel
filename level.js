class Level extends GameObject {
    static preload() {
        Level.sprite = loadImage('level.png');
        let levelURL = 'level' + (location.hash == '' ? '1' : location.hash.substr(1)) + '.json';
        Level.levelData = loadJSON(levelURL);
    }

    constructor() {
        super(Level.sprite);
        this.data = Level.levelData;
    }

    draw() {
        if (this.data.name == 'Level 1') {
            image(Level.sprite, 0, 300);
        } else {
            fill('black');
            noStroke();
            for (let plat of this.data.platforms) {
                rect(plat.x, plat.y, plat.w, plat.h);
            }
        }
    }
}
