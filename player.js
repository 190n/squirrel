// mass = 0.3kg

class Player extends GameObject {
    static preload() {
        Player.sprite = loadImage('sq_right.png');
        Player.flame0 = loadImage('flame0.png');
    }

    constructor() {
        super(Player.sprite);
        this.x = 100;
        this.y = 100;
        this.w = 16;
        this.h = 24;
        this.dx = 0;
        this.dy = 0;
        this.flamethrowerOffset = 0;
    }

    tick(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dy += gravity * pixelsToMeter * dt;

        if (keyIsDown(p1RocketLeft)) {
            this.flamethrowerOffset += flamethrowerTurnRate * dt;
        }

        if (keyIsDown(p1RocketRight)) {
            this.flamethrowerOffset -= flamethrowerTurnRate * dt;
        }

        if (!keyIsDown(p1RocketLeft) && !keyIsDown(p1RocketRight)) {
            
        }

        this.flamethrowerOffset = max(min(this.flamethrowerOffset, flamethrowerMaxOffsetAngle), -flamethrowerMaxOffsetAngle);

        if (keyIsDown(p1Rocket)) {
            this.dy -= flamethrowerAccel * dt * cos(this.flamethrowerOffset);
            this.dx -= flamethrowerAccel * dt * sin(this.flamethrowerOffset);
        }
    }

    draw() {
        GameObject.prototype.draw.call(this);
        if (keyIsDown(p1Rocket)) {
            push();
            translate(this.x, this.y)
            rotate(-this.flamethrowerOffset);
            image(Player.flame0, 0, 90);
            pop();
        }
    }
}
