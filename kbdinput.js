class KBDInput extends Input {
    constructor() {
        super();
        this.p1RocketAngle = 0;
        this.p2RocketAngle = 0;

        this.binds = {
            isFiringRocket: [undefined, p1Rocket, p2Rocket],
            isShooting: [undefined, p1Shoot, p2Shoot],
            shootDown: [undefined, p1ShootDown, p2ShootDown]
        };

        this.facing = [undefined, 'left', 'left'];
    }

    readFacingFromLevel() {
        this.facing[1] = globalObjects.level.data.spawns['1'].facing;
        this.facing[2] = globalObjects.level.data.spawns['2'].facing;
    }

    tick(dt) {
        if (keyIsDown(p1RocketLeft)) {
            this.p1RocketAngle += rocketTurnRate * dt;
            this.facing[1] = 'left';
        }

        if (keyIsDown(p1RocketRight)) {
            this.p1RocketAngle -= rocketTurnRate * dt;
            this.facing[1] = 'right';
        }

        if (this.p1RocketAngle !== 0 && !keyIsDown(p1RocketLeft) && !keyIsDown(p1RocketRight)) {
            if (this.p1RocketAngle > 0) {
                this.p1RocketAngle -= rocketTurnRate * dt;
                if (this.p1RocketAngle < 0) this.p1RocketAngle = 0;
            } else if (this.p1RocketAngle < 0) {
                this.p1RocketAngle += rocketTurnRate * dt;
                if (this.p1RocketAngle > 0) this.p1RocketAngle = 0;
            }
        }

        this.p1RocketAngle = Math.max(Math.min(this.p1RocketAngle, rocketMaxOffsetAngle), -rocketMaxOffsetAngle);

        if (keyIsDown(p2RocketLeft)) {
            this.p2RocketAngle += rocketTurnRate * dt;
            this.facing[2] = 'left';
        }

        if (keyIsDown(p2RocketRight)) {
            this.p2RocketAngle -= rocketTurnRate * dt;
            this.facing[2] = 'right';
        }

        if (this.p2RocketAngle !== 0 && !keyIsDown(p2RocketLeft) && !keyIsDown(p2RocketRight)) {
            if (this.p2RocketAngle > 0) {
                this.p2RocketAngle -= rocketTurnRate * dt;
                if (this.p2RocketAngle < 0) this.p2RocketAngle = 0;
            } else if (this.p2RocketAngle < 0) {
                this.p2RocketAngle += rocketTurnRate * dt;
                if (this.p2RocketAngle > 0) this.p2RocketAngle = 0;
            }
        }

        this.p2RocketAngle = Math.max(Math.min(this.p2RocketAngle, rocketMaxOffsetAngle), -rocketMaxOffsetAngle);
    }

    rocketAngle(which) {
        if (which == 1) {
            return this.p1RocketAngle;
        } else if (which == 2) {
            return this.p2RocketAngle;
        }
    }

    isFiringRocket(which) {
        return keyIsDown(this.binds.isFiringRocket[which]);
    }

    isShooting(which) {
        return keyIsDown(this.binds.isShooting[which]);
    }

    shootAngle(which) {
        let shootAngle = bulletDefaultLaunchAngle;
        if (keyIsDown(this.binds.isFiringRocket[which])) {
            shootAngle = bulletMaxLaunchAngle;
        }
        if (keyIsDown(this.binds.shootDown[which])) {
            shootAngle = -bulletMaxLaunchAngle;
        }

        if (this.facing[which] == 'left') shootAngle = Math.PI - shootAngle;
        return shootAngle;
    }

    directionFacing(which) {
        return this.facing[which];
    }
}
