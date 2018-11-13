class GameObject {
    constructor(sprite) {
        this.sprite = sprite;
    }

    draw() {
        image(this.sprite, this.x, this.y);
    }

    tick() {

    }

    static preload() {

    }
}
