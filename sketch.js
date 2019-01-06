let gameObjects = [],
    lastFrame,
    rollingStart,
    camera,
    hud,
    frameIter = 0,
    fps = 0,
    frameTimes = [],
    globalObjects = {},
    gameStarted = false,
    font04b03;

p5.disableFriendlyErrors = true;

function preload() {
    Player.preload();
    Level.preload();
    HUD.preload();
    HowToPlay.preload();

    font04b03 = loadFont('04b03.ttf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);
    rectMode(CENTER);
    noSmooth();
    // gameObjects = [new HowToPlay()];
    startGame();
    lastFrame = Date.now();
    rollingStart = lastFrame;
    frameRate(120);
}

function startGame() {
    let level = new Level(),
        p1 = new Player(1),
        p2 = new Player(2);
    gameObjects = [level, p1, p2];
    hud = new HUD();
    globalObjects = {level, p1, p2};
    p1.spawn();
    p2.spawn();
    camera = new Camera();
    gameStarted = true;
}

function draw() {
    background('#6699ff');
    let now = Date.now(),
        dt = Math.min(maxDeltaTime, (now - lastFrame) / 1000);

    if (gameStarted) {
        camera.move();
        camera.transformCanvas();
    }

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
        gameObjects[i].tick(dt);
    }

    resetMatrix();

    if (gameStarted) {
        hud.draw();
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
