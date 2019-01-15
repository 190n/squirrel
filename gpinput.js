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
                }
            }
        }
    }

    displayPrompt() {
        let msg = '',
            gps = this.getConnectedGamepads();
        if (gps.length < 2) {
            msg = 'Connect two controllers. You may need\nto disconnect and reconnect a controller.';
            msg += `\nCurrently connected: ${gps.length}`;
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
        return 0;
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
}
