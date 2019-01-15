const squirrelMass = 0.3,
    pixelsToMeter = 144,
    gravity = 9.8,
    rocketForce = 5,
    rocketAccel = rocketForce / squirrelMass * pixelsToMeter,
    rocketMaxOffsetAngle = Math.PI / 6, // 30°
    rocketTurnRate = Math.PI * 2, // 360°/sec
    onGroundFriction = 30, // m/s²
    airResistance = 0.0005, // m/s² per m/s
    showFps = true,
    moreStats = false, // shows frametime graph
    timePerBullet = 0.15, // seconds
    bulleLifetime = 5, // seconds
    bulletLaunchVelocity = 20 * pixelsToMeter,
    bulletDefaultLaunchAngle = Math.PI / -12, // 15° up
    bulletMaxLaunchAngle = Math.PI / -3, // 60° up or down (only when player launches bullet up or down)
    maxDeltaTime = 0.05, // seconds
    bulletMass = 0.05,
    bulletIterations = 16,
    p1BulletTrailColor = 'rgba(153, 204, 255, ',
    p2BulletTrailColor = 'rgba(255, 153, 153, ',
    p1Color = '#0066cc',
    p2Color = '#cc3300',
    p1BulletColor = '#000066',
    p2BulletColor = '#660000',
    bulletTrailLength = 3,
    playerDySpriteThreshold = 100,
    cameraPadding = 400,
    cameraMaxZoom = 1.5,
    cameraCorrectionFactor = 0.1,
    playerFuelDrain = 1/6, // maximum fuel is 1 unit; this is units/sec
    playerFuelRefillRate = 2, // units/sec
    playerMaxAmmo = 32,
    playerAmmoRefillTime = 3,
    playerIndicatorPadding = 32,
    radarMaxSize = 128;
