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
    moreStats = false, // shows frametime graph
    timePerBullet = 0.15, // seconds
    bulleLifetime = 5, // seconds
    bulletLaunchVelocity = 7.5 * pixelsToMeter,
    bulletDefaultLaunchAngle = Math.PI / -9, // 20°
    bulletMaxLaunchAngle = Math.PI / -3; // 60° up or down (only when player launches bullet up or down)
