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
