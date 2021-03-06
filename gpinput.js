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
