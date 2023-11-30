import { Vec2 } from '../math';
import {Trait} from '../Trait';

export  class PipeTraveller extends Trait {
    public direction = new Vec2(0, 0);
    public movement= new Vec2(0, 0);
    public distance= new Vec2(0, 0);
}
