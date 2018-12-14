class Player extends GameObject {
    static preload() {
        Player.sprite = loadImage('player.gif');
        Player.sp1l = loadImage('p1_left.png');
        Player.sp1r = loadImage('p1_right.png');
        Player.sp2l = loadImage('p2_left.png');
        Player.sp2r = loadImage('p2_right.png');
        Player.flame0 = loadImage('flame0.png');
    }

    constructor(which) {
        super(which == 2 ? Player.sp2r : Player.sp1r);
        this.facing = 'right';
        this.which = which;
        this.w = 24;
        this.h = 72;
        this.dx = 0;
        this.dy = 0;
        this.flamethrowerOffset = 0;
        this.onGround = false;
        this.sideEnteredFrom = null;
        this.shootTimer = -1; // negative = can shoot. if it isn't negative, it will count up in real time and be reset after configurable delay

        if (this.which == 1) {
            [this.rocket, this.rocketLeft, this.rocketRight, this.shoot, this.shootDown] = [p1Rocket, p1RocketLeft, p1RocketRight, p1Shoot, p1ShootDown];
        } else if (this.which == 2) {
            [this.rocket, this.rocketLeft, this.rocketRight, this.shoot, this.shootDown] = [p2Rocket, p2RocketLeft, p2RocketRight, p2Shoot, p2ShootDown];
        }
    }

    spawn() {
        Object.assign(this, globalObjects.level.data.spawns[this.which.toString()]);
    }

    tick(dt) {
        this.move(dt);
        this.doGravity(dt);

        if (this.onGround) {
            this.dx = applyForceAgainstMotion(this.dx, onGroundFriction * pixelsToMeter * dt);
        } else {
            this.doAirResistance(dt);
        }

        if (keyIsDown(this.rocketLeft)) {
            this.flamethrowerOffset += flamethrowerTurnRate * dt;
            this.facing = 'left';
            this.sprite = (this.which == 2 ? Player.sp2l : Player.sp1l);
        }

        if (keyIsDown(this.rocketRight)) {
            this.flamethrowerOffset -= flamethrowerTurnRate * dt;
            this.facing = 'right';
            this.sprite = (this.which == 2 ? Player.sp2r : Player.sp1r);
        }

        if (!keyIsDown(this.rocketLeft) && !keyIsDown(this.rocketRight) && this.flamethrowerOffset !== 0) {
            if (this.flamethrowerOffset > 0) {
                this.flamethrowerOffset -= flamethrowerTurnRate * dt;
                if (this.flamethrowerOffset < 0) this.flamethrowerOffset = 0;
            } else if (this.flamethrowerOffset < 0) {
                this.flamethrowerOffset += flamethrowerTurnRate * dt;
                if (this.flamethrowerOffset > 0) this.flamethrowerOffset = 0;
            }
        }

        this.flamethrowerOffset = max(min(this.flamethrowerOffset, flamethrowerMaxOffsetAngle), -flamethrowerMaxOffsetAngle);

        if (keyIsDown(this.rocket)) {
            this.dy -= flamethrowerAccel * dt * cos(this.flamethrowerOffset);
            this.dx -= flamethrowerAccel * dt * sin(this.flamethrowerOffset);
        }

        if (keyIsDown(this.shoot) && this.shootTimer < 0) {
            let launchAngle = bulletDefaultLaunchAngle;
            if (keyIsDown(this.rocket)) {
                launchAngle = bulletMaxLaunchAngle;
            }
            if (keyIsDown(this.shootDown)) {
                launchAngle = -bulletMaxLaunchAngle;
            }
            if (this.facing == 'left') launchAngle = Math.PI - launchAngle;
            let dx = bulletLaunchVelocity * cos(launchAngle),
                dy = bulletLaunchVelocity * sin(launchAngle);
            gameObjects.push(new Bullet(this.x, this.y, dx + this.dx, dy + this.dy, this.which));
            this.shootTimer = 0;
        }

        if (this.shootTimer >= 0) {
            this.shootTimer += dt;
            if (this.shootTimer >= timePerBullet) this.shootTimer = -1;
        }

        this.collideLevel();
    }

    draw() {
        let row = (this.facing == 'left' ? 0 : 1),
            col = (this.which == 1 ? 0 : 3);

        if (Math.abs(this.dy) < playerDySpriteThreshold) {
            col++;
        } else if (this.dy < 0) {
            col += 2;
        }

        image(Player.sprite, this.x + (this.facing == 'left' ? 6 : -6), this.y + 4, 68, 80, col * 68, row * 80, 68, 80);

        if (keyIsDown(this.rocket)) {
            push();
            translate(this.x, this.y + 36)
            rotate(-this.flamethrowerOffset);
            image(Player.flame0, 0, 54);
            pop();
        }
    }

    collideLevel() {
        let collidedAny = false;

        for (let plat of globalObjects.level.data.platforms) {
            if (bboxCollide(this, plat)) {
                // they collide
                collidedAny = true;
                if (this.sideEnteredFrom === null) {
                    this.sideEnteredFrom = getCollisionSide(this, plat);
                }

                if (this.sideEnteredFrom == 'up' && 'up' in plat.blocks) {
                    this.dy *= -plat.blocks.up;
                } else if (this.sideEnteredFrom == 'down' && 'down' in plat.blocks && !(this.onGround && keyIsDown(this.rocket))) {
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

    collideBullet(b) {
        this.dx += (bulletMass * b.dx) / squirrelMass;
        this.dy += (bulletMass * b.dy) / squirrelMass;
    }
}
