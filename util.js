function bboxCollide(o1, o2) {
    return o1.x - o1.w / 2 < o2.x + o2.w / 2
        && o1.x + o1.w / 2 > o2.x - o2.w / 2
        && o1.y - o1.h / 2 < o2.y + o2.h / 2
        && o1.y + o1.h / 2 > o2.y - o2.h / 2;
}
