class Bullet extends GameObject {
    static preload() {
        Bullet.sprite1 = loadImage('data:image/gif;base64,R0lGODlhCAAIAPAAAAAAZgAAACH5BAAAAAAALAAAAAAIAAgAAAIHhI+py+1dAAA7');
        Bullet.sprite2 = loadImage('data:image/gif;base64,R0lGODlhCAAIAPAAAGYAAAAAACH5BAAAAAAALAAAAAAIAAgAAAIHhI+py+1dAAA7');
    }

    constructor(x, y, dx, dy, firedBy) {
        super(firedBy == 2 ? Bullet.sprite2 : Bullet.sprite1);
        this.x = x;
        this.y = y;
        this.w = 8;
        this.h = 8;
        this.dx = dx;
        this.dy = dy;
        this.firedBy = firedBy;
        this.age = 0;
        this.lastX = x;
        this.lastY = y;

        if (firedBy == 1) {
            [this.target, this.trailColor] = [globalObjects.p2, p1BulletTrailColor];
        } else if (firedBy == 2) {
            [this.target, this.trailColor] = [globalObjects.p1, p2BulletTrailColor];
        }

        this.gfx = createGraphics(800, 800);
        this.gfx.blendMode(ADD);
        this.gfx.fill('rgba(0, 0, 0, 0.0625)');
        this.gfx.strokeWeight(2);
        this.gfx.strokeCap(SQUARE);
        this.gfx.stroke(this.trailColor);
        this.minX = this.x - 2;
        this.maxX = this.x + 2;
        this.minY = this.y - 2;
        this.maxY = this.y + 2;
    }

    tick(dt) {
        this.lastX = this.x;
        this.lastY = this.y;
        dt /= bulletIterations;
        for (let i = 0; i < bulletIterations; i++) {
            this.move(dt);
            this.doGravity(dt);
            this.doAirResistance(dt);
            this.age += dt;
            if (this.age >= bulleLifetime) {
                return this.destroy();
            }

            for (let plat of globalObjects.level.data.platforms) {
                if (bboxCollide(this, plat)) {
                    return this.destroy();
                }
            }

            if (bboxCollide(this, this.target)) {
                this.target.collideBullet(this);
                return this.destroy();
            }
        }
    }

    draw() {
        this.gfx.line(this.x, this.y, this.lastX, this.lastY);

        if (this.x + 2 > this.maxX) this.maxX = this.x + 2;
        if (this.x - 2 < this.minX) this.minX = this.x - 2;
        if (this.y + 2 > this.maxY) this.maxY = this.y + 2;
        if (this.y - 2 < this.minY) this.minY = this.y - 2;

        this.maxX = Math.min(800, this.maxX);
        this.minX = Math.max(0, this.minX);
        this.maxY = Math.min(800, this.maxY);
        this.minY = Math.min(0, this.minY);

        this.gfx.loadPixels();
        for (let x = this.minX; x < this.maxX; x++) {
            for (let y = this.minY; y < this.maxY; y++) {
                this.gfx.pixels[(y * 800 + x) * 4 + 3] -= 16;
            }
        }
        this.gfx.updatePixels();


        image(this.gfx, 400, 400);

        GameObject.prototype.draw.call(this);
    }

    destroy() {
        removeObject(this);
        this.gfx.remove();
    }
}
