class Player extends GameObject {
    static preload() {
        Player.sprite = loadImage('sq_right.png');
        Player.flame0 = loadImage('flame0.png');
    }

    constructor(level) {
        super(Player.sprite);
        this.level = level;
        this.x = 100;
        this.y = 100;
        this.w = 40;
        this.h = 72;
        this.dx = 0;
        this.dy = 0;
        this.flamethrowerOffset = 0;
        this.onGround = false;
        this.sideEnteredFrom = null;
    }

    tick(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dy += gravity * pixelsToMeter * dt;

        if (this.onGround) {
            this.dx = applyForceAgainstMotion(this.dx, onGroundFriction * pixelsToMeter * dt);
        } else {
            this.dx = applyForceAgainstMotion(this.dx, airResistance * Math.abs(this.dx) * pixelsToMeter * dt);
            this.dy = applyForceAgainstMotion(this.dy, airResistance * Math.abs(this.dy) * pixelsToMeter * dt);
        }

        if (keyIsDown(p1RocketLeft)) {
            this.flamethrowerOffset += flamethrowerTurnRate * dt;
        }

        if (keyIsDown(p1RocketRight)) {
            this.flamethrowerOffset -= flamethrowerTurnRate * dt;
        }

        if (!keyIsDown(p1RocketLeft) && !keyIsDown(p1RocketRight) && this.flamethrowerOffset !== 0) {
            if (this.flamethrowerOffset > 0) {
                this.flamethrowerOffset -= flamethrowerTurnRate * dt;
                if (this.flamethrowerOffset < 0) this.flamethrowerOffset = 0;
            } else if (this.flamethrowerOffset < 0) {
                this.flamethrowerOffset += flamethrowerTurnRate * dt;
                if (this.flamethrowerOffset > 0) this.flamethrowerOffset = 0;
            }
        }

        this.flamethrowerOffset = max(min(this.flamethrowerOffset, flamethrowerMaxOffsetAngle), -flamethrowerMaxOffsetAngle);

        if (keyIsDown(p1Rocket)) {
            this.dy -= flamethrowerAccel * dt * cos(this.flamethrowerOffset);
            this.dx -= flamethrowerAccel * dt * sin(this.flamethrowerOffset);
        }

        this.collideLevel();
    }

    draw() {
        GameObject.prototype.draw.call(this);
        if (keyIsDown(p1Rocket)) {
            push();
            translate(this.x, this.y + 36)
            rotate(-this.flamethrowerOffset);
            image(Player.flame0, 0, 54);
            pop();
        }
    }

    collideLevel() {
        let collidedAny = false;

        for (let plat of this.level.data.platforms) {
            if (bboxCollide(this, plat)) {
                // they collide
                collidedAny = true;
                if (this.sideEnteredFrom === null) {
                    this.sideEnteredFrom = getCollisionSide(this, plat);
                }

                if (this.sideEnteredFrom == 'up' && 'up' in plat.blocks) {
                    this.dy *= -plat.blocks.up;
                } else if (this.sideEnteredFrom == 'down' && 'down' in plat.blocks && !(this.onGround && keyIsDown(p1Rocket))) {
                    if (this.dy > 0) {
                        this.y = plat.y - plat.h / 2 - this.h / 2;
                        this.onGround = true;
                    }
                    this.dy *= -plat.blocks.down;
                } else if (this.sideEnteredFrom == 'left' && 'left' in plat.blocks) {
                    this.dx *= -plat.blocks.left;
                } else if (this.sideEnteredFrom == 'right' && 'right' in plat.blocks) {
                    this.dx *= -plat.blocks.right;
                }

                if (this.sideEnteredFrom != 'down' || !('down' in plat.blocks)) this.onGround = false;
            }
        }

        if (!collidedAny) {
            this.onGround = false;
            this.sideEnteredFrom = null;
        }
    }
}
