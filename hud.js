class HUD extends GameObject {
    constructor() {
        super();
    }

    tick(dt) {

    }

    draw() {
        strokeWeight(4);
        strokeJoin(MITER);
        stroke('#0000ff');
        noFill();
        rect(38, 10, 68, 12);
        stroke('#ff0000');
        rect(38, 30, 68, 12);
        noStroke();
        fill('#0000ff');
        rect(38, 10, globalObjects.p1.fuel * 64, 8);
    }
}
