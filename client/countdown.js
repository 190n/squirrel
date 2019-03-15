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
