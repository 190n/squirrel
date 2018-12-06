class Bullet extends GameObject {
    static preload() {
        Bullet.sprite1 = loadImage('p1_bullet.png');
        Bullet.sprite2 = loadImage('p2_bullet.png');
    }

    constructor(x, y, dx, dy, firedBy) {
        super(firedBy == 2 ? Bullet.sprite2 : Bullet.sprite1);
        this.x = x;
        this.y = y;
        this.w = 8;
        this.h = 8;
        this.dx = dx;
        this.dy = dy;
        this.age = 0;
    }

    tick(dt) {
        this.move(dt);
        this.doGravity(dt);
        this.doAirResistance(dt);
        this.age += dt;
        if (this.age >= bulleLifetime) {
            removeObject(this);
        }
    }
}
