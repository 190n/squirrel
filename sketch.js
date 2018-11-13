let gameObjects = [],
    lastFrame;

function preload() {
    Player.preload();
}

function setup() {
    createCanvas(800, 800);
    imageMode(CENTER);
    gameObjects = [new Player()];
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
