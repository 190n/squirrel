class GameObject {
    constructor(sprite) {
        this.sprite = sprite;
    }

    draw(sprite) {
        image(sprite === undefined ? this.sprite : sprite, this.x, this.y);
    }

    tick() {

    }

    static preload() {

    }
}
