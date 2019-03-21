/*
    Differences from Player:
        - controls are always for player 1
        - movement may not be processed locally
*/

class NetworkedPlayer extends Player {}

class LocalPlayer extends NetworkedPlayer {
    constructor(which, socket) {
        super(which);
        this.socket = socket;
    }

    tick(dt) {
        Player.prototype.tick.call(this, dt);
        // send updated state to network
        this.socket.emit('state', {
            which: this.which,
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy,
            facing: input.directionFacing(this.which),
            rocketStrength: input.rocketStrength(this.which),
            rocketAngle: input.rocketAngle(this.which),
            fuel: this.fuel,
            ammo: this.ammo
        });
    }
}

class RemotePlayer extends NetworkedPlayer {
    constructor(which, socket) {
        super(which);
        this.socket = socket;
        this.socket.on('state', s => {
            if (s.which == this.which) {
                Object.assign(this, s);
            }
        });
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

        this.collideLevel();
    }

    draw() {
        this.drawWithoutInput(this.facing, this.rocketStrength, this.rocketAngle);
    }
}
