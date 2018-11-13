const squirrelMass = 0.3,
    pixelsToMeter = 144,
    gravity = 9.8,
    flamethrowerForce = 5,
    flamethrowerAccel = flamethrowerForce / squirrelMass * pixelsToMeter,
    flamethrowerMaxOffsetAngle = Math.PI / 6, // 30°
    flamethrowerTurnRate = Math.PI / 3; // 60°/sec
