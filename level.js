class Level extends GameObject {
    static preload() {
        Level.sprite = loadImage('level.png');
    }

    constructor() {
        super(Level.sprite);
    }
}
