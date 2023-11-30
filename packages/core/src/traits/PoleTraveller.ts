import { Vec2 } from '../math.js';
import {Trait} from '../Trait.js';

export  class PoleTraveller extends Trait {
    public distance = 0;
    public heading = new Vec2(1, 0);
}
