function bboxCollide(o1, o2) {
    return o1.x - o1.w / 2 < o2.x + o2.w / 2
        && o1.x + o1.w / 2 > o2.x - o2.w / 2
        && o1.y - o1.h / 2 < o2.y + o2.h / 2
        && o1.y + o1.h / 2 > o2.y - o2.h / 2;
}

function getCollisionSide(source, target) {
    let downErr = Math.abs(target.y - target.h / 2 - source.y - source.h / 2),
        upErr = Math.abs(source.y - source.h / 2 - target.y - target.h / 2),
        rightErr = Math.abs(target.x - target.w / 2 - source.x - source.w / 2),
        leftErr = Math.abs(source.x - source.w / 2 - target.x - target.w / 2);

    let min = Math.min(upErr, downErr, leftErr, rightErr);

    if (min == upErr) return 'up';
    else if (min == downErr) return 'down';
    else if (min == leftErr) return 'left';
    else return 'right';
}

function applyForceAgainstMotion(v, accel) {
    if (v === 0) return v;

    let newV = v;

    if (v > 0) {
        newV -= accel;
        if (newV < 0) newV = 0;
    } else if (v < 0) {
        newV += accel;
        if (newV > 0) newV = 0;
    }

    return newV;
}

function closestWithinScreen(x, y, padding=0) {
    // adopted from https://stackoverflow.com/a/1585620
    let cenX = windowWidth / 2,
        cenY = windowHeight / 2,
        w = windowWidth - padding * 2,
        h = windowHeight - padding * 2,
        s = (y - cenY) / (x - cenX);

    // flip coordinates around center to fix algorithm
    x = x;
    y = 2 * cenY - y;
    let intX = null, intY = null;

    if (-h / 2 <= s * w / 2 && s * w / 2 <= h / 2) {
        // right or left edge
        if (x > cenX) {
            // right edge
            intX = cenX + w / 2;
            intY = cenY + s * w / 2;
        } else if (x < cenX) {
            // left edge
            intX = cenX - w / 2;
            intY = cenY - s * w / 2;
        }
    } else if (-w / 2 <= (h / 2) / s && (h / 2) / s <= w / 2) {
        // top or bottom edge
        if (y > cenY) {
            // top edge
            intY = cenY - h / 2;
            intX = cenX - (h / 2) / s;
        } else if (y < cenY) {
            // bottom edge
            intY = cenY + h / 2;
            intX = cenX + (h / 2) / s;
        }
    }

    return [intX, intY];
}

function angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
