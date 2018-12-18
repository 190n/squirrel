class Camera {
    constructor() {
        this.x = windowWidth / 2;
        this.y = windowHeight / 2;

        this.factor = 1;
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

    transformCanvas() {
        resetMatrix();
        translate(windowWidth / 2, windowHeight / 2);
        scale(this.factor);
        translate(-this.x, -this.y);
    }
}
