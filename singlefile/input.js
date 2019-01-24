class Input {
    constructor() {
        this.ready = true;
        this.facing = [undefined, 'left', 'left'];
    }

    readFacingFromLevel() {
        this.facing[1] = globalObjects.level.data.spawns['1'].facing;
        this.facing[2] = globalObjects.level.data.spawns['2'].facing;
    }

    tick(dt) {

    }

    displayPrompt() {

    }

    rocketAngle(which) {
        return 0;
    }

    rocketStrength(which) {
        return 0;
    }

    isShooting(which) {
        return false;
    }

    shootAngle(which) {
        return 0;
    }

    isReloading(which) {
        return false;
    }

    directionFacing(which) {
        return 'right';
    }
}
