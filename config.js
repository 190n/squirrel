const squirrelMass = 0.3,
    pixelsToMeter = 144,
    gravity = 9.8,
    flamethrowerForce = 5,
    flamethrowerAccel = flamethrowerForce / squirrelMass * pixelsToMeter,
    flamethrowerMaxOffsetAngle = Math.PI / 6, // 30°
    flamethrowerTurnRate = Math.PI * 2, // 360°/sec
    onGroundFriction = 30, // m/s²
    airResistance = 0.0005, // m/s² per m/s
    showFps = true,
    moreStats = false; // shows frametime graph
