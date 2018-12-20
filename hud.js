class HUD extends GameObject {
    static preload() {
        HUD.iconsSprite = loadImage('data:image/gif;base64,R0lGODlhEAAIAPIBAAAAAGYAAAAAZv+ZmZnM/wAAAAAAAAAAACH5BAEAAAAALAAAAAAQAAgAAAMjSLBMw2wQIqqYY4QdMrWVw3EDCI6jaaGcWrEboC4sA0LjkgAAOw==');
    }

    constructor() {
        super();
    }

    tick(dt) {

    }

    draw() {
        image(HUD.iconsSprite, 20, 20, 32, 32, 0, 0, 8, 8);
        image(HUD.iconsSprite, 20, 56, 32, 32, 8, 0, 8, 8);

        strokeWeight(4);
        strokeJoin(MITER);
        stroke(p1BulletColor);
        noFill();
        rect(74, 12, 68, 12);
        stroke(p2BulletColor);
        rect(74, 48, 68, 12);
        noStroke();
        fill(p1Color);
        rect(42 + globalObjects.p1.fuel * 32, 12, globalObjects.p1.fuel * 64, 8);
        fill(p2Color);
        rect(42 + globalObjects.p2.fuel * 32, 48, globalObjects.p2.fuel * 64, 8);
    }
}
