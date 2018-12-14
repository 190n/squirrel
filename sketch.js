let gameObjects = [],
    lastFrame,
    rollingStart,
    camera,
    frameIter = 0,
    fps = 0,
    frameTimes = [],
    globalObjects = {};

p5.disableFriendlyErrors = true;

function preload() {
    Player.preload();
    Level.preload();
    Bullet.preload();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    rectMode(CENTER);
    noSmooth();
    let level = new Level(),
        p1 = new Player(1),
        p2 = new Player(2);
    gameObjects = [level, p1, p2];
    globalObjects = {level, p1, p2};
    p1.spawn();
    p2.spawn();
    camera = new Camera();
    lastFrame = Date.now();
    rollingStart = lastFrame;
    frameRate(120);
}

function draw() {
    background(255);
    camera.move();
    camera.transformCanvas();
    let now = Date.now(),
        dt = Math.min(maxDeltaTime, (now - lastFrame) / 1000);

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
        gameObjects[i].tick(dt);
    }

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
        textAlign(LEFT, TOP);
        text(fps.toString() + ' fps', 4, 4);
    }

    if (moreStats) {
        textSize(8);
        textAlign(LEFT, CENTER);
        text('16.67ms (60fps)', 65, 33);
        text('22.22ms (45fps)', 65, 44);
        text('27.78ms (36fps)', 65, 56);
        text('33.33ms (30fps)', 65, 67);

        stroke(192);
        line(0, 33, 64, 33);
        line(0, 44, 64, 44);
        line(0, 56, 64, 56);
        line(0, 67, 64, 67);

        frameTimes.push(now - lastFrame);
        if (frameTimes.length > 32) frameTimes.shift();
        stroke(0);
        for (let i = 0; i < frameTimes.length - 1; i++) {
            line(i * 2, frameTimes[i] * 2, i * 2 + 2, frameTimes[i + 1] * 2);
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
