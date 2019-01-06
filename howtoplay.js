class HowToPlay extends GameObject {
    static preload() {
        HowToPlay.keyIcons = loadImage('keyicons.png');
        HowToPlay.p1Keys = ['w', 'a', 's', 'd', 'f'];
        HowToPlay.p2Keys = ['i', 'j', 'k', 'l', 'h'];
    }

    constructor() {
        super();
        this.confirmTimer = 0;
        this.timer = 0;

        for (let k of ['keys1Fly', 'keys1Shoot']) {
            this[k] = {
                w: false,
                a: false,
                s: false,
                d: false,
                f: false
            };
        }

        for (let k of ['keys2Fly', 'keys2Shoot']) {
            this[k] = {
                i: false,
                j: false,
                k: false,
                l: false,
                h: false
            };
        }
    }

    // returns the (x, y) coordinates of the top left corner of the part of the keyicons.png sprite to use for a certain key
    getKeyOffset(whichKey, pressed) {

        let forP2 = HowToPlay.p2Keys.includes(whichKey)
        let x = forP2 ? (10 * HowToPlay.p2Keys.indexOf(whichKey)) : (10 * HowToPlay.p1Keys.indexOf(whichKey)), y = forP2 ? 26 : 0;

        if (pressed) y += 13;
        return [x, y];
    }

    drawKey(x, y, whichKey, pressed) {
        let [sx, sy] = this.getKeyOffset(whichKey, pressed);

        image(HowToPlay.keyIcons, x + 5, y + 6.5, 10, 13, sx, sy, 10, 13);
    }

    tick(dt) {
        // fly:
        // 1s rocket
        // 1s rocket + rocketLeft
        // 1s rocket + rocketRight
        // 1s none

        // shoot:
        // 1s shoot
        // 1s shoot + rocket (shoot up)
        // 1s shoot + shootDown
        // 1s none

        this.timer += dt;
        this.timer = this.timer % 4;

        this.keys1Fly.w = this.keys2Fly.i = (this.timer < 3);
        this.keys1Fly.a = this.keys2Fly.j = (this.timer >= 1 && this.timer < 2);
        this.keys1Fly.d = this.keys2Fly.l = (this.timer >= 2 && this.timer < 3);

        this.keys1Shoot.f = this.keys2Shoot.h = (this.timer < 3);
        this.keys1Shoot.w = this.keys2Shoot.i = (this.timer >= 1 && this.timer < 2);
        this.keys1Shoot.s = this.keys2Shoot.k = (this.timer >= 2 && this.timer < 3);

        if (keyIsDown(p1Rocket) && keyIsDown(p2Rocket)) {
            this.confirmTimer += dt;
        }

        if (this.confirmTimer >= 1) {
            // TODO
        }
    }

    draw() {
        resetMatrix();
        translate(width / 2 - 436, height / 2 - 166);
        scale(4);

        for (let i in HowToPlay.p1Keys) {
            let k = HowToPlay.p1Keys[i];
            this.drawKey(33 + 12 * i, 9, k, this.keys1Fly[k]);
            this.drawKey(33 + 12 * i, 58, k, this.keys1Shoot[k]);
        }

        for (let i in HowToPlay.p2Keys) {
            let k = HowToPlay.p2Keys[i];
            this.drawKey(160 + 12 * i, 9, k, this.keys2Fly[k]);
            this.drawKey(160 + 12 * i, 58, k, this.keys2Shoot[k]);
        }

        resetMatrix();
    }
}
