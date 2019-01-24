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
