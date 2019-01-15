class HUD extends GameObject {
    static preload() {
        HUD.iconsSprite = loadImage('data:image/gif;base64,R0lGODlhKAAQAPIEAAAAZmYAAP+ZmZnM/8wzAMwzAMwzAMwzACH5BAEKAAQALAAAAAAoABAAAANvOLQ8wuxBAKAlIdgxKOWCkGWhRV1QtnmeM47SwqLYOLHe+94nujO4nE4F9NB+siBgSCQEL0OesYZ04qA603RRtc4sUZq4+GQwNWOxsmJmptXKlPt9WffOTXpyzcXrpWV4aH9fe0s2bXlvPXWHRwEJADs=');
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
            let [indX, indY] = closestWithinScreen(sx1, sy1, playerIndicatorPadding);
            let rot = angleBetweenPoints(windowWidth / 2, windowHeight / 2, indX, indY) + Math.PI / 2;
            push();
            translate(indX, indY);
            rotate(rot);
            image(HUD.iconsSprite, 0, 24, 48, 64, 16, 0, 12, 16);
            pop();
        }

        if (sx2 < 0 || sx2 > windowWidth || sy2 < 0 || sy2 > windowHeight) {
            // player 2 outside screen
            let [indX, indY] = closestWithinScreen(sx2, sy2, playerIndicatorPadding);
            let rot = angleBetweenPoints(windowWidth / 2, windowHeight / 2, indX, indY) + Math.PI / 2;
            push();
            translate(indX, indY);
            rotate(rot);
            image(HUD.iconsSprite, 0, 24, 48, 64, 28, 0, 12, 16);
            pop();
        }

        let sz = globalObjects.level.data.safeZone;

        let radarScale = radarMaxSize / Math.max(sz.w, sz.h),
            radarW = sz.w * radarScale,
            radarH = sz.h * radarScale;

        fill('rgba(0, 0, 0, 0.2)');
        rect(4 + radarW / 2, 76 + radarH / 2, radarW, radarH);

        let p1szx = globalObjects.p1.x - sz.x + (sz.w / 2),
            p1szy = globalObjects.p1.y - sz.y + (sz.h / 2),
            p2szx = globalObjects.p2.x - sz.x + (sz.w / 2),
            p2szy = globalObjects.p2.y - sz.y + (sz.h / 2);

        fill(p1BulletColor);
        rect(p1szx * radarScale + 4, p1szy * radarScale + 76, 4, 4);
        fill(p2BulletColor);
        rect(p2szx * radarScale + 4, p2szy * radarScale + 76, 4, 4);
    }
}
