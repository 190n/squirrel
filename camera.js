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

        this.factor = Math.min(windowWidth / wadj, cameraMaxZoom);
        this.x = (x1 + x2) / 2;
        this.y = (y1 + y2) / 2;
    }

    transformCanvas() {
        resetMatrix();
        translate(-this.x + windowWidth / 2 / this.factor, -this.y + windowHeight / 2 / this.factor);
        scale(this.factor);
        // noFill();
        // stroke(0);
        // rect(this.x, this.y, windowWidth / this.factor, windowHeight / this.factor);
    }
}
