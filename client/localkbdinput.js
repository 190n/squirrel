// LocalKBDInput always uses bindings for player 1, no matter which player is being controlled

class LocalKBDInput extends KBDInput {}

for (let func of ['rocketAngle', 'rocketStrength', 'isShooting', 'isReloading', 'shootAngle', 'directionFacing']) {
    LocalKBDInput.prototype[func] = function() {
        return KBDInput.prototype[func].call(this, 1);
    };
}
