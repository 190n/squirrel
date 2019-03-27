class Player extends GameObject {
    static preload() {
        Player.sprite = loadImage('player.png');
        Player.flame0 = loadImage('flame0.png');
    }

    constructor(which) {
        super();
        this.which = which;
        this.w = 24;
        this.h = 72;
        this.dx = 0;
        this.dy = 0;
        this.onGround = false;
        this.sideEnteredFrom = null;
        this.shootTimer = -1; // negative = can shoot. if it isn't negative, it will count up in real time and be reset after configurable delay
        this.fuel = 1;
        this.ammo = playerMaxAmmo;
        this.reloadTimer = -1;

        /*if (this.which == 1) {
            [this.rocket, this.rocketLeft, this.rocketRight, this.shoot, this.shootDown] = [p1Rocket, p1RocketLeft, p1RocketRight, p1Shoot, p1ShootDown];
        } else if (this.which == 2) {
            [this.rocket, this.rocketLeft, this.rocketRight, this.shoot, this.shootDown] = [p2Rocket, p2RocketLeft, p2RocketRight, p2Shoot, p2ShootDown];
        }*/
    }

    spawn() {
        Object.assign(this, globalObjects.level.data.spawns[this.which.toString()]);
    }

    tick(dt) {
        this.move(dt);
        this.doGravity(dt);

        if (this.onGround) {
            this.dx = applyForceAgainstMotion(this.dx, onGroundFriction * pixelsToMeter * dt);
            if (this.fuel < 1) {
                this.fuel += playerFuelRefillRate * dt;
                if (this.fuel > 1) this.fuel = 1;
            }
        } else {
            this.doAirResistance(dt);
        }

        // if (input.rocketStrength(this.which) > 0 && this.fuel > 0) {
        //     this.dy -= rocketAccel * dt * cos(input.rocketAngle(this.which));
        //     this.dx -= rocketAccel * dt * sin(input.rocketAngle(this.which));
        //     this.fuel -= playerFuelDrain * dt;
        // }

        let rs = Math.max(0, Math.min(1, input.rocketStrength(this.which)));
        if (this.fuel > 0) {
            this.dy -= rs * rocketAccel * dt * Math.cos(input.rocketAngle(this.which));
            this.dx -= rs * rocketAccel * dt * Math.sin(input.rocketAngle(this.which));
            this.fuel -= rs * playerFuelDrain * dt;
        }

        if (input.isReloading(this.which) && this.ammo < playerMaxAmmo && this.reloadTimer < 0) {
            this.reloadTimer = 0;
        }

        if (input.isShooting(this.which) && this.shootTimer < 0 && this.ammo > 0) {
            let launchAngle = input.shootAngle(this.which);
            let dx = bulletLaunchVelocity * cos(launchAngle),
                dy = bulletLaunchVelocity * sin(launchAngle);
            gameObjects.push(new Bullet(this.x, this.y, dx + this.dx, dy + this.dy, this.which, false));
            this.shootTimer = 0;
            this.ammo--;
            this.reloadTimer = -1;
            if (this.ammo == 0) {
                this.reloadTimer = 0;
            }
        }

        if (this.shootTimer >= 0) {
            this.shootTimer += dt;
            if (this.shootTimer >= timePerBullet) this.shootTimer = -1;
        }

        if (this.reloadTimer >= 0) {
            this.reloadTimer += dt;
            if (this.reloadTimer >= playerAmmoRefillTime) {
                this.reloadTimer = -1;
                this.ammo = playerMaxAmmo;
            }
        }

        this.collideLevel();

        if (!bboxCollide(this, globalObjects.level.data.safeZone)) {
            playerLost(this);
        }
    }

    draw() {
        this.drawWithoutInput(input.directionFacing(this.which), input.rocketStrength(this.which), input.rocketAngle(this.which));
    }

    drawWithoutInput(facing, rocketStrength, rocketAngle) {
        let row = (facing == 'left' ? 0 : 1),
            col = (this.which == 1 ? 0 : 3);

        if (Math.abs(this.dy) < playerDySpriteThreshold) {
            col++;
        } else if (this.dy < 0) {
            col += 2;
        }

        image(Player.sprite, (this.x << 0) + (facing == 'left' ? 6 : -6), (this.y << 0) + 4, 68, 80, col * 68, row * 80, 68, 80);

        if (rocketStrength > 0 && this.fuel > 0) {
            push();
            translate(this.x << 0, (this.y << 0) + 36);
            rotate(-rocketAngle);
            scale(1, rocketStrength);
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
                } else if (this.sideEnteredFrom == 'down' && 'down' in plat.blocks && !(this.onGround && input.rocketStrength(this.which > 0))) {
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

    lose() {

    }
}
