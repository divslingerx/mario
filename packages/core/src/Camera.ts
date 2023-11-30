import {Vec2} from './math';

export class Camera {
    pos: Vec2;
    size: Vec2;
    min: Vec2;
    max: Vec2;
    
    constructor() {
        this.pos = new Vec2(0, 0);
        this.size = new Vec2(256, 224);

        this.min = new Vec2(0, 0);
        this.max = new Vec2(Infinity, Infinity);
    }
}
