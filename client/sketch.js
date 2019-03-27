let gameObjects = [],
    lastFrame,
    rollingStart,
    camera,
    hud,
    wcDisplay,
    countdown,
    input,
    frameIter = 0,
    fps = 0,
    frameTimes = [],
    globalObjects = {},
    gameStarted = false,
    htpVisible = false,
    htpWhichTab = 1,
    font04b03,
    p1WinCount = 0,
    p2WinCount = 0,
    ignoreLosses = false,
    paused = false,
    socket;

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
    lastFrame = Date.now();
    rollingStart = lastFrame;
    wcDisplay = new WCDisplay();
    countdown = new Countdown();
    wcDisplay.timer = -1;
    input = new LocalKBDInput();
    frameRate(1200);
    startGame();
}

function startGame() {
    whichIsLocal = parseInt(prompt('Which player is local? (1/2)'));
    socket = io();

    socket.on('update', receiveNetworkUpdate);
    socket.on('newBullet', b => {
        bullet = new Bullet(b.x, b.y, b.dx, b.dy, b.firedBy, true);
        bullet.id = b.id;
        gameObjects.push(bullet);
    });

    let level = new Level(), p1, p2;

    if (whichIsLocal == 1) {
        p1 = new LocalPlayer(1, socket);
        p2 = new RemotePlayer(2, socket);
    } else if (whichIsLocal == 2) {
        p1 = new RemotePlayer(1, socket);
        p2 = new LocalPlayer(2, socket);
    }

    gameObjects = [level, p1, p2];
    hud = new HUD();
    globalObjects = {level, p1, p2};
    input.readFacingFromLevel();
    p1.spawn();
    p2.spawn();
    camera = new Camera();
    ignoreLosses = false;
    gameStarted = true;
}

function draw() {
    background('#6699cc');
    let now = Date.now(),
        dt = Math.min(maxDeltaTime, (now - lastFrame) / 1000);

    input.tick(dt);
    countdown.tick(dt);

    if (gameStarted) {
        camera.move();
        camera.transformCanvas(1);
    }

    fill('#6699ff');
    noStroke();
    rect(globalObjects.level.data.safeZone.x, globalObjects.level.data.safeZone.y, globalObjects.level.data.safeZone.w * 0.75, globalObjects.level.data.safeZone.h * 0.75);

    hud.p1 = {
        x: globalObjects.p1.x,
        y: globalObjects.p1.y,
        fuel: globalObjects.p1.fuel,
        ammo: globalObjects.p1.ammo,
        reloadTimer: globalObjects.p1.reloadTimer
    };
    hud.p2 = {
        x: globalObjects.p2.x,
        y: globalObjects.p2.y,
        fuel: globalObjects.p2.fuel,
        ammo: globalObjects.p2.ammo,
        reloadTimer: globalObjects.p2.reloadTimer
    };

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
        if (!paused && input.ready && !countdown.active) {
            gameObjects[i].tick(dt);
        }
    }

    resetMatrix();

    if (gameStarted) {
        hud.draw();
        if (wcDisplay.timer < 2 && wcDisplay.timer >= 0) {
            wcDisplay.tick(dt);
            wcDisplay.draw();
        } else if (wcDisplay.timer >= 2) {
            startGame();
            wcDisplay.timer = -1;
        }
    }

    if (paused || !input.ready || countdown.active) {
        fill('rgba(102, 153, 255, 0.7)');
        rect(width / 2, height / 2, width, height);
    }

    if (paused) {
        fill(0);
        textFont(font04b03);
        textSize(256);
        textAlign(CENTER, CENTER);
        text('PAUSED', windowWidth / 2, windowHeight * 0.3);
    }

    if (!input.ready && !htpVisible) {
        input.displayPrompt();
        document.getElementById('htp-button').style.display = 'block';
    }

    else if (input.ready) {
        htpVisible = false;
        document.getElementById('howtoplay').style.display = 'none';
        document.getElementById('htp-button').style.display = 'none';
    }

    countdown.draw();

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

function playerLost(p) {
    if (ignoreLosses) return;
    ignoreLosses = true;
    if (p.which == 1) {
        p2WinCount++;
    } else if (p.which == 2) {
        p1WinCount++;
    }

    wcDisplay.reset(3 - p.which);
}

function togglePaused() {
    console.log('togglePaused');
    paused = !paused;
    if (!paused) {
        countdown.start();
    }
}

function toggleHTP() {
    htpVisible = !htpVisible;
    if (htpVisible) {
        document.getElementById('howtoplay').style.display = 'block';
    } else {
        document.getElementById('howtoplay').style.display = 'none';
    }
}

function switchHTPContent(which) {
    if (htpWhichTab == which) {
        return;
    }

    htpWhichTab = which;

    for (let nav of document.getElementsByClassName('htp-nav')) {
        if (nav.id == `htp-nav-${which}`) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    }

    for (let content of document.getElementsByClassName('htp-content')) {
        if (content.id == `htp-content-${which}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    }
}

function receiveNetworkUpdate(u) {
    for (let go of gameObjects) {
        if (go.id == u.id) {
            Object.assign(go, u);
        }
    }
}
