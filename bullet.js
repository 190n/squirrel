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

        if (firedBy == 1) {
            [this.target, this.trailColor] = [globalObjects.p2, p1BulletTrailColor];
        } else if (firedBy == 2) {
            [this.target, this.trailColor] = [globalObjects.p1, p2BulletTrailColor];
        }

        this.trailPoints = [];
    }

    tick(dt) {
        this.trailPoints.unshift([this.x, this.y]);
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
        strokeWeight(4);
        for (let i = 0; i < this.trailPoints.length - 1; i++) {
            let alpha = 1 - (i / bulletTrailLength / bulletIterations);
            stroke(this.trailColor + alpha.toString() + ')');
            line(this.trailPoints[i][0], this.trailPoints[i][1], this.trailPoints[i + 1][0], this.trailPoints[i + 1][1]);
        }

        while (this.trailPoints.length > bulletTrailLength * bulletIterations) this.trailPoints.pop();

        GameObject.prototype.draw.call(this);
    }

    destroy() {
        removeObject(this);
    }
}