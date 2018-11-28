let gameObjects = [],
    lastFrame;

function preload() {
    Player.preload();
    Level.preload();
}

function setup() {
    createCanvas(800, 800);
    imageMode(CENTER);
    rectMode(CENTER);
    noSmooth();
    let level = new Level();
    gameObjects = [level, new Player(level)];
    lastFrame = Date.now();
}

function draw() {
    background(255);
    let now = Date.now(),
        dt = (now - lastFrame) / 1000;

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
        gameObjects[i].tick(dt);
    }

    lastFrame = now;
}
