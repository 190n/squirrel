const p1Rocket = 87, // W
    p1RocketLeft = 65, // A
    p1RocketRight = 68, // D
    p1Shoot = 70, // F
    p1Reload = 82, // R
    p1ShootDown = 83, // S
    p2Rocket = 73, // I
    p2RocketLeft = 74, // J
    p2RocketRight = 76, // L
    p2Reload = 85, // U
    p2Shoot = 72, // H
    p2ShootDown = 75, // K
    pXPause = 27; // escape
const squirrelMass = 0.3,
    pixelsToMeter = 144,
    gravity = 9.8,
    rocketForce = 5,
    rocketAccel = rocketForce / squirrelMass * pixelsToMeter,
    rocketMaxOffsetAngle = Math.PI / 6, // 30°
    rocketTurnRate = Math.PI * 2, // 360°/sec
    onGroundFriction = 30, // m/s²
    airResistance = 0.0005, // m/s² per m/s
    showFps = true,
    moreStats = false, // shows frametime graph
    timePerBullet = 0.15, // seconds
    bulleLifetime = 5, // seconds
    bulletLaunchVelocity = 20 * pixelsToMeter,
    bulletDefaultLaunchAngle = Math.PI / -12, // 15° up
    bulletMaxLaunchAngle = Math.PI / -3, // 60° up or down (only when player launches bullet up or down)
    maxDeltaTime = 0.05, // seconds
    bulletMass = 0.1,
    bulletIterations = 16,
    p1BulletTrailColor = 'rgba(153, 204, 255, ',
    p2BulletTrailColor = 'rgba(255, 153, 153, ',
    p1Color = '#0066cc',
    p2Color = '#cc3300',
    p1BulletColor = '#000066',
    p2BulletColor = '#660000',
    bulletTrailLength = 0.25,
    playerDySpriteThreshold = 100,
    cameraPadding = 800,
    cameraMaxZoom = 0.5,
    cameraCorrectionFactor = 0.1,
    playerFuelDrain = 1/6, // maximum fuel is 1 unit; this is units/sec
    playerFuelRefillRate = 2, // units/sec
    playerMaxAmmo = 16,
    playerAmmoRefillTime = 2,
    playerIndicatorPadding = 32,
    radarMaxSize = 256,
    shootAngleDeadzoneSquared = 0.09; // actual deadzone = 0.3
function bboxCollide(o1, o2) {
    return o1.x - o1.w / 2 < o2.x + o2.w / 2
        && o1.x + o1.w / 2 > o2.x - o2.w / 2
        && o1.y - o1.h / 2 < o2.y + o2.h / 2
        && o1.y + o1.h / 2 > o2.y - o2.h / 2;
}

function getCollisionSide(source, target) {
    let downErr = Math.abs(target.y - target.h / 2 - source.y - source.h / 2),
        upErr = Math.abs(source.y - source.h / 2 - target.y - target.h / 2),
        rightErr = Math.abs(target.x - target.w / 2 - source.x - source.w / 2),
        leftErr = Math.abs(source.x - source.w / 2 - target.x - target.w / 2);

    let min = Math.min(upErr, downErr, leftErr, rightErr);

    if (min == upErr) return 'up';
    else if (min == downErr) return 'down';
    else if (min == leftErr) return 'left';
    else return 'right';
}

function applyForceAgainstMotion(v, accel) {
    if (v === 0) return v;

    let newV = v;

    if (v > 0) {
        newV -= accel;
        if (newV < 0) newV = 0;
    } else if (v < 0) {
        newV += accel;
        if (newV > 0) newV = 0;
    }

    return newV;
}

function closestWithinScreen(x, y, padding=0) {
    // adopted from https://stackoverflow.com/a/1585620
    let cenX = windowWidth / 2,
        cenY = windowHeight / 2,
        w = windowWidth - padding * 2,
        h = windowHeight - padding * 2,
        s = (y - cenY) / (x - cenX);

    // flip coordinates around center to fix algorithm
    x = x;
    y = 2 * cenY - y;
    let intX = null, intY = null;

    if (-h / 2 <= s * w / 2 && s * w / 2 <= h / 2) {
        // right or left edge
        if (x > cenX) {
            // right edge
            intX = cenX + w / 2;
            intY = cenY + s * w / 2;
        } else if (x < cenX) {
            // left edge
            intX = cenX - w / 2;
            intY = cenY - s * w / 2;
        }
    } else if (-w / 2 <= (h / 2) / s && (h / 2) / s <= w / 2) {
        // top or bottom edge
        if (y > cenY) {
            // top edge
            intY = cenY - h / 2;
            intX = cenX - (h / 2) / s;
        } else if (y < cenY) {
            // bottom edge
            intY = cenY + h / 2;
            intX = cenX + (h / 2) / s;
        }
    }

    return [intX, intY];
}

function angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.factor = 1;
        this.move();
        this.x = this.idealX;
        this.y = this.idealY;
        this.factor = this.idealFactor;
    }

    move() {
        let x1 = globalObjects.p1.x,
            y1 = globalObjects.p1.y,
            x2 = globalObjects.p2.x,
            y2 = globalObjects.p2.y;

        let ratio = windowWidth / windowHeight,
            wmin = Math.abs(x2 - x1) + cameraPadding,
            hmin = Math.abs(y2 - y1) + cameraPadding,
            wadj = (wmin / hmin > ratio ? wmin : ratio * hmin);

        this.idealFactor = Math.min(windowWidth / wadj, cameraMaxZoom);
        this.idealX = (x1 + x2) / 2;
        this.idealY = (y1 + y2) / 2;

        this.x += cameraCorrectionFactor * (this.idealX - this.x);
        this.y += cameraCorrectionFactor * (this.idealY - this.y);
        this.factor += cameraCorrectionFactor * (this.idealFactor - this.factor);
    }

    transformCanvas(amount) {
        resetMatrix();
        translate(windowWidth / 2, windowHeight / 2);
        scale(this.factor * amount);
        translate(-this.x * amount, -this.y * amount);
    }
}
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
class KBDInput extends Input {
    constructor() {
        super();
        this.p1RocketAngle = 0;
        this.p2RocketAngle = 0;

        this.binds = {
            isFiringRocket: [undefined, p1Rocket, p2Rocket],
            isShooting: [undefined, p1Shoot, p2Shoot],
            shootDown: [undefined, p1ShootDown, p2ShootDown],
            isReloading: [undefined, p1Reload, p2Reload]
        };

        this.lastPauseButtonState = false;
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

        if (!this.lastPauseButtonState && keyIsDown(pXPause)) {
            togglePaused();
        }

        this.lastPauseButtonState = keyIsDown(pXPause);
    }

    rocketAngle(which) {
        if (which == 1) {
            return this.p1RocketAngle;
        } else if (which == 2) {
            return this.p2RocketAngle;
        }
    }

    rocketStrength(which) {
        return keyIsDown(this.binds.isFiringRocket[which]) ? 1 : 0;
    }

    isShooting(which) {
        return keyIsDown(this.binds.isShooting[which]);
    }

    isReloading(which) {
        return keyIsDown(this.binds.isReloading[which]);
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
class GPInput extends Input {
    // based on Logitech F310 in Xinput mode (switch on back set to "X")
    // should work for other controllers if the browser maps the controllers' bindings

    constructor() {
        super();
        this.ready = false;
        this.p1Index = -1;
        this.p2Index = -1;
        this.gp1 = null;
        this.gp2 = null;
        this.shootAngles = [undefined, 0, 0];
        this.lastStartButtonState = [undefined, false, false];
    }

    readFacingFromLevel() {
        Input.prototype.readFacingFromLevel.call(this);
        this.shootAngles[1] = this.facing[1] == 'right' ? bulletDefaultLaunchAngle : Math.PI - bulletDefaultLaunchAngle;
        this.shootAngles[2] = this.facing[2] == 'right' ? bulletDefaultLaunchAngle : Math.PI - bulletDefaultLaunchAngle;
    }

    getConnectedGamepads() {
        return [...navigator.getGamepads()].filter(gp => gp instanceof Gamepad && gp.connected);
    }

    tick(dt) {
        let gps = this.getConnectedGamepads();

        if (gps.length < 2) {
            this.ready = false;
            this.p1Index = -1;
            this.p2Index = -1;
            if (!htpVisible && keyIsDown(32)) {
                // spacebar
                input = new KBDInput();
                input.readFacingFromLevel();
            }
        } else if (!this.ready) {
            let idxsPressing = [];

            for (let i in gps) {
                // LB+RB
                if (gps[i].buttons[4].pressed && gps[i].buttons[5].pressed && this.p1Index != i && this.p2Index != i) {
                    idxsPressing.push(gps[i].index);
                }
            }

            if (idxsPressing.length == 1) {
                if (this.p1Index == -1) {
                    this.p1Index = idxsPressing[0];
                } else if (this.p2Index == -1) {
                    this.p2Index = idxsPressing[0];
                    this.gp1 = navigator.getGamepads()[this.p1Index];
                    this.gp2 = navigator.getGamepads()[this.p2Index];
                    this.ready = true;
                    countdown.start();
                }
            }
        } else {
            let [x1, y1] = this.getRightStickXY(this.gp1);
            let [x2, y2] = this.getRightStickXY(this.gp2);
            if (this.calcOffsetSquared(x1, y1) > shootAngleDeadzoneSquared) {
                let angle = this.calcAngle(x1, y1)
                this.shootAngles[1] = angle;
                this.facing[1] = (-Math.PI / 2 < angle && angle < Math.PI / 2) ? 'right' : 'left';
            }

            if (this.calcOffsetSquared(x2, y2) > shootAngleDeadzoneSquared) {
                let angle = this.calcAngle(x2, y2);
                this.shootAngles[2] = angle;
                this.facing[2] = (-Math.PI / 2 < angle && angle < Math.PI / 2) ? 'right' : 'left';
            }

            if (!this.lastStartButtonState[1] && this.isStartButtonPressed(this.gp1)) {
                togglePaused();
            } else if (!this.lastStartButtonState[2] && this.isStartButtonPressed(this.gp2)) {
                togglePaused();
            }

            this.lastStartButtonState[1] = this.isStartButtonPressed(this.gp1);
            this.lastStartButtonState[2] = this.isStartButtonPressed(this.gp2);
        }
    }

    displayPrompt() {
        let msg = '',
            gps = this.getConnectedGamepads();
        if (gps.length < 2) {
            msg = 'Connect two controllers. You may need\nto disconnect and reconnect a controller.';
            msg += `\nCurrently connected: ${gps.length}\n`;
            msg += 'Press space to use keyboard controls';
        } else if (this.p1Index == -1) {
            msg = 'Press LB+RB on only player 1\'s controller';
        } else if (this.p2Index == -1) {
            msg = 'Press LB+RB on only player 2\'s controller';
        }

        textAlign(CENTER, CENTER);
        textFont(font04b03);
        textSize(32);
        fill(0);
        text(msg, width / 2, height / 2);
    }

    rocketAngle(which) {
        if (!this.ready) return 0;
        if (which == 1) {
            return -this.gp1.axes[0] * rocketMaxOffsetAngle;
        } else if (which == 2) {
            return -this.gp2.axes[0] * rocketMaxOffsetAngle;
        }
    }

    rocketStrength(which) {
        if (!this.ready) return 0;
        if (which == 1) {
            if (this.gp1.mapping == 'standard') {
                return this.gp1.buttons[6].value;
            } else {
                return this.gp1.axes[2] / 2 + 0.5;
            }
        } else if (which == 2) {
            if (this.gp2.mapping == 'standard') {
                return this.gp2.buttons[6].value;
            } else {
                return this.gp2.axes[2] / 2 + 0.5;
            }
        }
    }

    isShooting(which) {
        if (!this.ready) return false;
        if (which == 1) {
            return this.gp1.buttons[5].pressed;
        } else if (which == 2) {
            return this.gp2.buttons[5].pressed;
        }
    }

    shootAngle(which) {
        return this.shootAngles[which];
    }

    isReloading(which) {
        if (which == 1) {
            return this.gp1.buttons[2].pressed;
        } else if (which == 2) {
            return this.gp2.buttons[2].pressed;
        }
    }

    getRightStickXY(gp) {
        if (gp.mapping == 'standard') {
            return [gp.axes[2], gp.axes[3]];
        } else {
            return [gp.axes[3], gp.axes[4]];
        }
    }

    isStartButtonPressed(gp) {
        if (gp.mapping == 'standard') {
            return gp.buttons[9].pressed;
        } else {
            return gp.buttons[7].pressed;
        }
    }

    calcAngle(x, y) {
        return Math.atan2(y, x);
    }

    calcOffsetSquared(x, y) {
        return x ** 2 + y ** 2;
    }

    directionFacing(which) {
        return this.facing[which];
    }
}
class GameObject {
    constructor(sprite) {
        this.sprite = sprite;
    }

    draw(sprite) {
        image(sprite === undefined ? this.sprite : sprite, this.x, this.y);
    }

    tick(dt) {

    }

    move(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }

    doGravity(dt) {
        this.dy += gravity * pixelsToMeter * dt;
    }

    doAirResistance(dt) {
        this.dx = applyForceAgainstMotion(this.dx, airResistance * Math.abs(this.dx) * pixelsToMeter * dt);
        this.dy = applyForceAgainstMotion(this.dy, airResistance * Math.abs(this.dy) * pixelsToMeter * dt);
    }

    static preload() {

    }
}
class WCDisplay extends GameObject {
    reset(whichToInc) {
        this.timer = 0;
        this.whichToInc = whichToInc;
        if (whichToInc == 1) {
            this.p1WinCount = p1WinCount - 1;
            this.p2WinCount = p2WinCount;
        } else if (whichToInc == 2) {
            this.p1WinCount = p1WinCount;
            this.p2WinCount = p2WinCount - 1;
        }

        this.incd = false;
    }

    tick(dt) {
        this.timer += dt;
        if (!this.incd && this.timer > 0.5) {
            this.incd = true;
            if (this.whichToInc == 1) {
                this.p1WinCount++;
            } else if (this.whichToInc == 2) {
                this.p2WinCount++;
            }
        }
    }

    draw() {
        let size = 256;
        if (this.timer > 0.5) {
            size = Math.max(352 - 64 * this.timer, 256);
        }

        textFont(font04b03);
        textSize(this.whichToInc == 1 ? size : 256);
        textAlign(RIGHT, CENTER);
        noStroke();
        fill(p1BulletColor);
        text(this.p1WinCount.toString(), windowWidth / 2 - 80, windowHeight * 0.3);
        fill(p2BulletColor);
        textSize(this.whichToInc == 2 ? size : 256);
        textAlign(LEFT, CENTER);
        text(this.p2WinCount.toString(), windowWidth / 2 + 80, windowHeight * 0.3);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(256);
        text('-', windowWidth / 2, windowHeight * 0.3);

        let opacity = Math.max(1.5 - this.timer, 0);
        textSize(size);
        fill('rgba(255, 255, 255, ' + opacity + ')');
        if (this.whichToInc == 1 && this.timer > 0.5) {
            textAlign(RIGHT, CENTER);
            text(p1WinCount.toString(), windowWidth / 2 - 80, windowHeight * 0.3);
        } else if (this.whichToInc == 2 && this.timer > 0.5) {
            textAlign(LEFT, CENTER);
            text(p2WinCount.toString(), windowWidth / 2 + 80, windowHeight * 0.3);
        }
    }
}
class Countdown {
    constructor() {
        this.timer = -1;
        this.active = false;
    }

    start() {
        this.timer = 0;
        this.active = true;
    }

    tick(dt) {
        if (this.timer >= 0) {
            this.timer += dt;
            if (this.timer > 1.5) {
                this.timer = -1;
                this.active = false;
            }
        }
    }

    draw() {
        textFont(font04b03);
        textSize(256);
        fill(0);
        textAlign(CENTER, CENTER);

        if (this.timer >= 0 && this.timer < 0.5) {
            text('3', windowWidth / 2, windowHeight * 0.3);
        } else if (this.timer >= 0.5 && this.timer < 1) {
            text('2', windowWidth / 2, windowHeight * 0.3);
        } else if (this.timer >= 1) {
            text('1', windowWidth / 2, windowHeight * 0.3);
        }
    }
}
class Bullet extends GameObject {

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
            [this.target, this.trailColor, this.color] = [globalObjects.p2, p1BulletTrailColor, p1BulletColor];
        } else if (firedBy == 2) {
            [this.target, this.trailColor, this.color] = [globalObjects.p1, p2BulletTrailColor, p2BulletColor];
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
            line(this.trailPoints[i][0] << 0, this.trailPoints[i][1] << 0, this.trailPoints[i + 1][0] << 0, this.trailPoints[i + 1][1] << 0);
        }

        while (this.trailPoints.length > bulletTrailLength * bulletIterations) this.trailPoints.pop();

        fill(this.color);
        noStroke();
        rect(this.x << 0, this.y << 0, this.w, this.h);
    }

    destroy() {
        removeObject(this);
    }
}
class Level extends GameObject {
    static preload() {
        Level.sprite = loadImage('data:image/gif;base64,R0lGODlhjAocB/AAAAAAAAAAACH5BAEAAAAALAAAAACMChwHAAL+hI+py+0Po5y02ouz3rz7D4biSJbmiaZqE7TuC8fyTNf2jef6zvd+vQoKh8Si8YhMKpfMpvMJBfym1Kr1is3eotyu9wsOi8fksvmMTqvX7Lb7DU9p5/S6/c6L6/f8vv8PGBiGR1hoePgjqLjI2Oj4CBkpOUlZaXnJiKi5yXmI+QkaKjpKStZ5ippKVcra6voKGys7S1tre5ugqrvLG4P7CxwsPOzUa3x8Sqy8zNzs/AwdLT0th2x9jUetvc3dHYkNHo7lTV5ufo6err7OPiH+Dp/XPk9fb38Rn68/c9/v/w8woMCBBEvsO3iwoMKFDHEhfBivocSJFCtavIhREsT+jeEyevwIsg3HkdZCmjyJMqXKlSxJuuzFMqbMmSJe2lRFM6fOnTx7+oR1M2inn0SLthSK1JPRpUybOn0KlUjSqYSiWr3qj6rWOli7ev0KNizNrWSziD2L9lnZtVXSun0LN67cbWzr+piLN+8ou3x16P0LOLDgwYL6GrZBOLHiPYcby1gMObLkyZQNOr7corLmzcUwX+YMOrTo0YA9fyaNOjUI045Vu34NO/ZY1odl276di7Zh3Lx7+/49T/du4MRFC+9bPLny5cxtHefbPLri53alW7+OPTsg6nW1e4fLne338eTLmz+PPr369ezbu38PP778+fTr27+PP7/+/fz++/v/D2CAAg5IYIEGHohgggouyGCDDj4IYYQSTkhhhRZeiGGGGm7IYYcefghiiCKOSGKJJp6IYooqrshiiy6+CGOMMs5IY4023ohjjjruyGOPPv4IZJBCDklkkUYeiWSSSi7JZJNOPglllFJOSWWVVl6JZZZabslll15+CWaYYo5JZplmnolmmmquyWabbr4JZ5xyzklnnXbeiWeeeu7JZ59+/glooIIOSmihhh6KaKKKLspoo44+Cmmkkk5KaaWWXopppppuymmnnn4Kaqiijkpqqaaeimqqqq7KaquuvgprrLLOSmuttt6Ka6667sprr77+Cmywwg5LbLHGHov+bLLKLstss84+C2200k5LbbXWXottttpuy2233n4Lbrjijktuueaei2666q7LbrvuvgtvvPLOS2+99t6Lb7767stvv/7+C3DAAg9McMEGH4xwwgovzHDDDj8MccQST0xxxRZfjHHGGm/McccefwxyyCKPTHLJJp+Mcsoqr8xyyy6/DHPMMs9Mc80234xzzjrvzHPPPv8MdNBCD0100UYfjXTSSi/NdNNOPw111FJPTXXVVl+NddZab811115/DXbYYo9Ndtlmn4122mqvzXbbbr8Nd9xyz0133XbfjXfeeu/Nd99+/w144IIPTnjhhh+OeOKKL854444/Dnnkkk/+Tnnlll+Oeeaab855555/Dnrooo9Oeummn4566qqvznrrrr8Oe+yyz0577bbfjnvuuu/Oe+++/w588MIPT3zxxh+PfPLKL898884/D3300k9PffXWX4999tpvz3333n8Pfvjij09++eafj3766q/Pfvvuvw9//PLPT3/99t+Pf/76789///7/D8AACnCABCygAQ+IwAQqcIEMbKADHwjBCEpwghSsoAUviMEManCDHOygBz8IwhCKcIQkLKEJT4jCFKpwhSxsoQtfCMMYynCGNKyhDW+IwxzqcIc87KEPfwjEIApxiEQsohGPiMQkKnGJTGyiE58IxShKcYpUrKL+Fa+IxSxqcYtc7KIXvwjGMIpxjGQsoxnPiMY0qnGNbGyjG98IxzjKcY50rKMd74jHPOpxj3zsox//CMhACnKQhCykIQ+JyEQqcpGMbKQjHwnJSEpykpSspCUviclManKTnOykJz8JylCKcpSkLKUpT4nKVKpylaxspStfCctYynKWtKylLW+Jy1zqcpe87KUvfwnMYApzmMQspjGPicxkKnOZzGymM58JzWhKc5rUrKY1r4nNbGpzm9zspje/Cc5winOc5CynOc+JznSqc53sbKc73wnPeMpznvSspz3vic986nOf/OynP/8J0IAKdKAELahBD4rQhCp0oQxtqEP+HwrRiEp0ohStqEUvitGManSjHO2oRz8K0pCKdKQkLalJT4rSlKp0pSxtqUtfCtOYynSmNK2pTW+K05zqdKc87alPfwrUoAp1qEQtqlGPitSkKnWpTG2qU58K1ahKdapUrapVr4rVrGp1q1ztqle/CtawinWsZC2rWc+K1rSqda1sbatb3wrXuMp1rnStq13vite86nWvfO2rX/8K2MAKdrCELaxhD4vYxCp2sYxtrGMfC9nISnaylK2sZS+L2cxqdrOc7axnPwva0Ip2tKQtrWlPi9rUqna1rG2ta18L29jKdra0ra1t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');
        Level.level1 = {
            "platforms": [
                {
                    "x": 0,
                    "y": 0,
                    "w": 400,
                    "h": 50,
                    "blocks": {"down": 0, "left": 0.8, "right": 0.8}
                },
                {
                    "x": 0,
                    "y": 390,
                    "w": 800,
                    "h": 20,
                    "blocks": {"down": 0, "left": 0, "right": 0}
                },
                {
                    "x": 1000,
                    "y": -100,
                    "w": 20,
                    "h": 400,
                    "blocks": {"up": 0, "down": 0, "left": 0.5, "right": 0.5}
                },
                {
                    "x": 1200,
                    "y": -150,
                    "w": 300,
                    "h": 50,
                    "blocks": {"down": 0, "left": 0, "right": 0}
                },
                {
                    "x": -1000,
                    "y": -100,
                    "w": 20,
                    "h": 400,
                    "blocks": {"up": 0, "down": 0, "left": 0.5, "right": 0.5}
                },
                {
                    "x": -1200,
                    "y": -150,
                    "w": 300,
                    "h": 50,
                    "blocks": {"down": 0, "left": 0, "right": 0}
                },
                {
                    "x": -500,
                    "y": -600,
                    "w": 200,
                    "h": 20,
                    "blocks": {"down": 0, "left": 0.5, "right": 0.5}
                },
                {
                    "x": 500,
                    "y": -600,
                    "w": 200,
                    "h": 20,
                    "blocks": {"down": 0, "left": 0.5, "right": 0.5}
                },
                {
                    "x": 800,
                    "y": 1200,
                    "w": 600,
                    "h": 20,
                    "blocks": {"down": 1}
                },
                {
                    "x": -800,
                    "y": 1200,
                    "w": 600,
                    "h": 20,
                    "blocks": {"down": 1}
                }
            ],
            "spawns": {
                "1": {
                    "x": -300,
                    "y": 344,
                    "facing": "right"
                },
                "2": {
                    "x": 300,
                    "y": 344,
                    "facing": "left"
                }
            },
            "safeZone": {
                "x": 0,
                "y": 0,
                "w": 9600,
                "h": 6400
            }
        };
    }

    constructor() {
        super(Level.sprite);
        this.data = Level.level1;
    }

    draw() {
        // fill('red');
        // noStroke();
        // for (let plat of this.data.platforms) {
        //     rect(plat.x, plat.y, plat.w, plat.h);
        // }

        image(Level.sprite, 0, 300);
    }
}
class Player extends GameObject {
    static preload() {
        Player.sprite = loadImage('data:image/gif;base64,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');
        Player.flame0 = loadImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAABsCAYAAAB5L9JVAAAABmJLR0QA/wBmAAB/fcthAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gsJFSkOJJO9xQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACiSURBVGje7dlBCoQwDAXQZPBG3mkONXfyTLovYicoFfRlW/RBP6kNZnRq/cYahcpf5NH6JwbX88E8m1k1Uxlen2E3s3muvXFZQh8OramcWbveZtZZl+GADK/OVB/en2Gxz2yp76EM633Y3hvdS4FAIBAIBJotbCkQCHSW7s1z/j0BgUAg0Gzxx6xhS4FAIBAIBN4PZvWBdubvzfQyBAKBLwA3RqopfODfSQkAAAAASUVORK5CYII=');
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
            gameObjects.push(new Bullet(this.x, this.y, dx + this.dx, dy + this.dy, this.which));
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
        let row = (input.directionFacing(this.which) == 'left' ? 0 : 1),
            col = (this.which == 1 ? 0 : 3);

        if (Math.abs(this.dy) < playerDySpriteThreshold) {
            col++;
        } else if (this.dy < 0) {
            col += 2;
        }

        image(Player.sprite, (this.x << 0) + (input.directionFacing(this.which) == 'left' ? 6 : -6), (this.y << 0) + 4, 68, 80, col * 68, row * 80, 68, 80);

        if (input.rocketStrength(this.which) > 0 && this.fuel > 0) {
            push();
            translate(this.x << 0, (this.y << 0) + 36);
            rotate(-input.rocketAngle(this.which));
            scale(1, input.rocketStrength(this.which));
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
class HUD extends GameObject {
    static preload() {
        HUD.iconsSprite = loadImage('data:image/gif;base64,R0lGODlhKAAQAPIEAAAAZmYAAP+ZmZnM/8wzAMwzAMwzAMwzACH5BAEKAAQALAAAAAAoABAAAANvOLQ8wuxBAKAlIdgxKOWCkGWhRV1QtnmeM47SwqLYOLHe+94nujO4nE4F9NB+siBgSCQEL0OesYZ04qA603RRtc4sUZq4+GQwNWOxsmJmptXKlPt9WffOTXpyzcXrpWV4aH9fe0s2bXlvPXWHRwEJADs=');
    }

    constructor() {
        super();
    }

    tick(dt) {

    }

    draw() {
        image(HUD.iconsSprite, 20, 20, 32, 32, 0, 0, 8, 8);
        image(HUD.iconsSprite, 20, 56, 32, 32, 8, 0, 8, 8);

        strokeWeight(4);
        strokeJoin(MITER);
        stroke(p1BulletColor);
        noFill();
        rect(74, 12, 68, 12);
        stroke(p2BulletColor);
        rect(74, 48, 68, 12);
        noStroke();
        fill(p1Color);
        rect(42 + this.p1.fuel * 32, 12, this.p1.fuel * 64, 8);
        fill(p2Color);
        rect(42 + this.p2.fuel * 32, 48, this.p2.fuel * 64, 8);

        textSize(16);
        textFont(font04b03);
        textAlign(LEFT, TOP);

        fill(p1BulletColor);
        rect(42, 30, 8, 8);
        text('x' + this.p1.ammo, 48, 22);
        fill(p2BulletColor);
        rect(42, 66, 8, 8);
        text('x' + this.p2.ammo, 48, 58);



        // calculate players' screen positions
        let cw = windowWidth / camera.factor,
            ch = windowHeight / camera.factor;

        let sx1 = camera.factor * (this.p1.x - camera.x + cw / 2),
            sy1 = camera.factor * (this.p1.y - camera.y + ch / 2),
            sx2 = camera.factor * (this.p2.x - camera.x + cw / 2),
            sy2 = camera.factor * (this.p2.y - camera.y + ch / 2);

        if (sx1 < 0 || sx1 > windowWidth || sy1 < 0 || sy1 > windowHeight) {
            // player 1 outside screen
            let [indX, indY] = closestWithinScreen(sx1, sy1, playerIndicatorPadding);
            let rot = angleBetweenPoints(windowWidth / 2, windowHeight / 2, indX, indY) + Math.PI / 2;
            push();
            translate(indX, indY);
            rotate(rot);
            image(HUD.iconsSprite, 0, 24, 48, 64, 16, 0, 12, 16);
            pop();
        }

        if (sx2 < 0 || sx2 > windowWidth || sy2 < 0 || sy2 > windowHeight) {
            // player 2 outside screen
            let [indX, indY] = closestWithinScreen(sx2, sy2, playerIndicatorPadding);
            let rot = angleBetweenPoints(windowWidth / 2, windowHeight / 2, indX, indY) + Math.PI / 2;
            push();
            translate(indX, indY);
            rotate(rot);
            image(HUD.iconsSprite, 0, 24, 48, 64, 28, 0, 12, 16);
            pop();
        }

        let sz = globalObjects.level.data.safeZone;

        let radarScale = radarMaxSize / Math.max(sz.w, sz.h),
            radarW = sz.w * radarScale,
            radarH = sz.h * radarScale;

        fill('rgba(0, 0, 0, 0.2)');
        rect(4 + radarW / 2, 76 + radarH / 2, radarW, radarH);

        let p1szx = this.p1.x - sz.x + (sz.w / 2),
            p1szy = this.p1.y - sz.y + (sz.h / 2),
            p2szx = this.p2.x - sz.x + (sz.w / 2),
            p2szy = this.p2.y - sz.y + (sz.h / 2);

        fill(p1BulletColor);
        rect(p1szx * radarScale + 4, p1szy * radarScale + 76, 4, 4);
        fill(p2BulletColor);
        rect(p2szx * radarScale + 4, p2szy * radarScale + 76, 4, 4);

        if (this.p1.reloadTimer > 0) {
            fill(p1BulletColor);
            textSize(32);
            textAlign(CENTER, BOTTOM);
            text('RELOADING', sx1, sy1 - 48 * camera.factor);
            rect(sx1, sy1 - 48 * camera.factor, 168 * this.p1.reloadTimer / playerAmmoRefillTime, 8);
        }

        if (this.p2.reloadTimer > 0) {
            fill(p2BulletColor);
            textSize(32);
            textAlign(CENTER, BOTTOM);
            text('RELOADING', sx2, sy2 - 48 * camera.factor);
            rect(sx2, sy2 - 48 * camera.factor, 168 * this.p2.reloadTimer / playerAmmoRefillTime, 8);
        }
    }
}
let gameObjects = [],
    lastFrame,
    rollingStart,
    camera,
    hud,
    wcDisplay,
    countdown,
    input,
    frameIter = 0,
    fps = 0,
    frameTimes = [],
    globalObjects = {},
    gameStarted = false,
    htpVisible = false,
    htpWhichTab = 1,
    font04b03,
    p1WinCount = 0,
    p2WinCount = 0,
    ignoreLosses = false,
    paused = false;

p5.disableFriendlyErrors = true;

function preload() {
    Player.preload();
    Level.preload();
    HUD.preload();

    font04b03 = loadFont('data:application/x-font-ttf;base64,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BQkFBggFCAgGCAgGCAgDBQgDCQgICAgGCAYICAkGCAgGAwYIBgAAAA0KBwAHBwMHCggKCgMFBQcHBQcDCggFCAgICAgICAgDAwcHBwgKCAgHCAcHCAgHCAgHCggICAgICAcICAoICAcFCgUHCAUICAcICAcICAMFCAMKCAgICAcIBwgICgcICAcDBwgHAAAADgsHAAcHBAcLCQsLBAUFBwcFBwQLCQUJCQkJCQkJCQQEBwcHCQsJCQcJBwcJCQcJCQcLCQkJCQkJBwkJCwkJBwULBQcJBQkJBwkJBwkJBAUJBAsJCQkJBwkHCQkLBwkJBwQHCQcAAAAPCwgACAgECAsJCwsEBgYICAYIBAsJBgkJCQkJCQkJBAQICAgJCwkJCAkICAkJCAkJCAsJCQkJCQkICQkLCQkIBgsGCAkGCQkICQkICQkEBgkECwkJCQkICQgJCQsICQkIBAgJCAAAABAMCAAICAQIDAoMDAQGBggIBggEDAoGCgoKCgoKCgoEBAgICAoMCgoICggICgoICgoIDAoKCgoKCggKCgwKCggGDAYICgYKCggKCggKCgQGCgQMCgoKCggKCAoKDAgKCggECAoIAAAAEQ0JAAkJBAkNCw0NBAYGCQkGCQQNCwYLCwsLCwsLCwQECQkJCw0LCwkLCQkLCwkLCwkNCwsLCwsLCQsLDQsLCQYNBgkLBgsLCQsLCQsLBAYLBA0LCwsLCQsJCwsNCQsLCQQJCwkAAAASDgkACQkFCQ4LDg4FBwcJCQcJBQ4LBwsLCwsLCwsLBQUJCQkLDgsLCQsJCQsLCQsLCQ4LCwsLCwsJCwsOCwsJBw4HCQsHCwsJCwsJCwsFBwsFDgsLCwsJCwkLCw4JCwsJBQkLCQAAABMOCgAKCgUKDgwODgUHBwoKBwoFDgwHDAwMDAwMDAwFBQoKCgwODAwKDAoKDAwKDAwKDgwMDAwMDAoMDA4MDAoHDgcKDAcMDAoMDAoMDAUHDAUODAwMDAoMCgwMDgoMDAoFCgwKAAAAFA8KAAoKBQoPDQ8PBQgICgoICgUPDQgNDQ0NDQ0NDQUFCgoKDQ8NDQoNCgoNDQoNDQoPDQ0NDQ0NCg0NDw0NCggPCAoNCA0NCg0NCg0NBQgNBQ8NDQ0NCg0KDQ0PCg0NCgUKDQoAAAAVEAsACwsFCxANEBAFCAgLCwgLBRANCA0NDQ0NDQ0NBQULCwsNEA0NCw0LCw0NCw0NCxANDQ0NDQ0LDQ0QDQ0LCBAICw0IDQ0LDQ0LDQ0FCA0FEA0NDQ0LDQsNDRALDQ0LBQsNCwAAABYRCwALCwYLEQ4REQYICAsLCAsGEQ4IDg4ODg4ODg4GBgsLCw4RDg4LDgsLDg4LDg4LEQ4ODg4ODgsODhEODgsIEQgLDggODgsODgsODgYIDgYRDg4ODgsOCw4OEQsODgsGCw4LAAAAFxEMAAwMBgwRDhERBgkJDAwJDAYRDgkODg4ODg4ODgYGDAwMDhEODgwODAwODgwODgwRDg4ODg4ODA4OEQ4ODAkRCQwOCQ4ODA4ODA4OBgkOBhEODg4ODA4MDg4RDA4ODAYMDgwAAAAYEgwADAwGDBIPEhIGCQkMDAkMBhIPCQ8PDw8PDw8PBgYMDAwPEg8PDA8MDA8PDA8PDBIPDw8PDw8MDw8SDw8MCRIJDA8JDw8MDw8MDw8GCQ8GEg8PDw8MDwwPDxIMDw8MBgwPDAAAAAAAAiYBkAAFAAECvAKKAAAAjwK8AooAAAHFADIBAwAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBbHRzAEAAICAQAu7/BgAAAu4A+gAAAAEAAAABAABS+rcfXw889QAAA+gAAAAAuqZ4/QAAAAC6pnj9AAD/BgJxAu4AAAADAAIAAQAAAAAAAQAAAu7/BgAAAu4AAAA+AnEAAQAAAAAAAAAAAAAAAAAAAGMAAQAAAGMAIAAFAAAAAAACAAgAQAAKAAAAYACnAAEAAQ==');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    rectMode(CENTER);
    noSmooth();
    lastFrame = Date.now();
    rollingStart = lastFrame;
    wcDisplay = new WCDisplay();
    countdown = new Countdown();
    wcDisplay.timer = -1;
    input = new GPInput();
    frameRate(1200);
    startGame();
}

function startGame() {
    let level = new Level(),
        p1 = new Player(1),
        p2 = new Player(2);
    gameObjects = [level, p1, p2];
    hud = new HUD();
    globalObjects = {level, p1, p2};
    input.readFacingFromLevel();
    p1.spawn();
    p2.spawn();
    camera = new Camera();
    ignoreLosses = false;
    gameStarted = true;
}

function draw() {
    background('#6699cc');
    let now = Date.now(),
        dt = Math.min(maxDeltaTime, (now - lastFrame) / 1000);

    input.tick(dt);
    countdown.tick(dt);

    if (gameStarted) {
        camera.move();
        camera.transformCanvas(1);
    }

    fill('#6699ff');
    noStroke();
    rect(globalObjects.level.data.safeZone.x, globalObjects.level.data.safeZone.y, globalObjects.level.data.safeZone.w * 0.75, globalObjects.level.data.safeZone.h * 0.75);

    hud.p1 = {
        x: globalObjects.p1.x,
        y: globalObjects.p1.y,
        fuel: globalObjects.p1.fuel,
        ammo: globalObjects.p1.ammo,
        reloadTimer: globalObjects.p1.reloadTimer
    };
    hud.p2 = {
        x: globalObjects.p2.x,
        y: globalObjects.p2.y,
        fuel: globalObjects.p2.fuel,
        ammo: globalObjects.p2.ammo,
        reloadTimer: globalObjects.p2.reloadTimer
    };

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
        if (!paused && input.ready && !countdown.active) {
            gameObjects[i].tick(dt);
        }
    }

    resetMatrix();

    if (gameStarted) {
        hud.draw();
        if (wcDisplay.timer < 2 && wcDisplay.timer >= 0) {
            wcDisplay.tick(dt);
            wcDisplay.draw();
        } else if (wcDisplay.timer >= 2) {
            startGame();
            wcDisplay.timer = -1;
        }
    }

    if (paused || !input.ready || countdown.active) {
        fill('rgba(102, 153, 255, 0.7)');
        rect(width / 2, height / 2, width, height);
    }

    if (paused) {
        fill(0);
        textFont(font04b03);
        textSize(256);
        textAlign(CENTER, CENTER);
        text('PAUSED', windowWidth / 2, windowHeight * 0.3);
    }

    if (!input.ready && !htpVisible) {
        input.displayPrompt();
        document.getElementById('htp-button').style.display = 'block';
    }

    else if (input.ready) {
        htpVisible = false;
        document.getElementById('howtoplay').style.display = 'none';
        document.getElementById('htp-button').style.display = 'none';
    }

    countdown.draw();

    if (showFps) {
        frameIter++;
        if (frameIter > 9) {
            fps = Math.round(10000 / (now - rollingStart));
            rollingStart = now;
            frameIter = 0;
        }

        fill(0);
        noStroke();
        strokeWeight(1);
        textSize(16);
        textFont('monospace');
        textAlign(LEFT, BOTTOM);
        text(fps.toString() + ' fps', 4, windowHeight - 4);
    }

    if (moreStats) {
        textSize(8);
        textAlign(RIGHT, CENTER);
        text('16.67ms (60fps)', windowWidth - 65, windowHeight - 33);
        text('22.22ms (45fps)', windowWidth - 65, windowHeight - 44);
        text('27.78ms (36fps)', windowWidth - 65, windowHeight - 56);
        text('33.33ms (30fps)', windowWidth - 65, windowHeight - 67);

        stroke(192);
        line(windowWidth - 64, windowHeight - 33, windowWidth, windowHeight - 33);
        line(windowWidth - 64, windowHeight - 44, windowWidth, windowHeight - 44);
        line(windowWidth - 64, windowHeight - 56, windowWidth, windowHeight - 56);
        line(windowWidth - 64, windowHeight - 67, windowWidth, windowHeight - 67);

        frameTimes.push(now - lastFrame);
        if (frameTimes.length > 32) frameTimes.shift();
        stroke(0);
        for (let i = 0; i < frameTimes.length - 1; i++) {
            line(windowWidth - i * 2, windowHeight - frameTimes[i] * 2, windowWidth - i * 2 - 2, windowHeight - frameTimes[i + 1] * 2);
        }

        let nSlow = 0;
        for (let ft of frameTimes) {
            if (ft > 17) nSlow++;
        }
    }

    lastFrame = now;
}

function removeObject(o) {
    gameObjects = gameObjects.filter(go => go != o);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function playerLost(p) {
    if (ignoreLosses) return;
    ignoreLosses = true;
    if (p.which == 1) {
        p2WinCount++;
    } else if (p.which == 2) {
        p1WinCount++;
    }

    wcDisplay.reset(3 - p.which);
}

function togglePaused() {
    console.log('togglePaused');
    paused = !paused;
    if (!paused) {
        countdown.start();
    }
}

function toggleHTP() {
    htpVisible = !htpVisible;
    if (htpVisible) {
        document.getElementById('howtoplay').style.display = 'block';
    } else {
        document.getElementById('howtoplay').style.display = 'none';
    }
}

function switchHTPContent(which) {
    if (htpWhichTab == which) {
        return;
    }

    htpWhichTab = which;

    for (let nav of document.getElementsByClassName('htp-nav')) {
        if (nav.id == `htp-nav-${which}`) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    }

    for (let content of document.getElementsByClassName('htp-content')) {
        if (content.id == `htp-content-${which}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    }
}
