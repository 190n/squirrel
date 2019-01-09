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

        textSize(16);
        textFont(font04b03);
        textAlign(LEFT, TOP);

        fill(p1BulletColor);
        rect(42, 30, 8, 8);
        text('x' + globalObjects.p1.ammo, 48, 22);
        fill(p2BulletColor);
        rect(42, 66, 8, 8);
        text('x' + globalObjects.p2.ammo, 48, 58);



        // calculate players' screen positions
        let cw = windowWidth / camera.factor,
            ch = windowHeight / camera.factor;

        let sx1 = camera.factor * (globalObjects.p1.x - camera.x + cw / 2),
            sy1 = camera.factor * (globalObjects.p1.y - camera.y + ch / 2),
            sx2 = camera.factor * (globalObjects.p2.x - camera.x + cw / 2),
            sy2 = camera.factor * (globalObjects.p2.y - camera.y + ch / 2);

        if (sx1 < 0 || sx1 > windowWidth || sy1 < 0 || sy1 > windowHeight) {
            // player 1 outside screen
            // let [indX, indY] = closestWithinScreen(sx1, sy1, playerIndicatorPadding);
            // ellipse(indX, indY, 10, 10);
        }
    }
}
