class GameObject {
    constructor(sprite) {
        this.sprite = sprite;
        this.id = GameObject.nextID++;
    }

    draw(sprite) {
        image(sprite === undefined ? this.sprite : sprite, this.x, this.y);
    }

    tick(dt) {

    }

    move(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }

    doGravity(dt) {
        this.dy += gravity * pixelsToMeter * dt;
    }

    doAirResistance(dt) {
        this.dx = applyForceAgainstMotion(this.dx, airResistance * Math.abs(this.dx) * pixelsToMeter * dt);
        this.dy = applyForceAgainstMotion(this.dy, airResistance * Math.abs(this.dy) * pixelsToMeter * dt);
    }

    static preload() {

    }

    sendNetworkUpdate(socket, data) {
        let dict = {id: this.id};

        Object.assign(dict, data);

        socket.emit('update', dict);
    }
}

GameObject.nextID = 0;
