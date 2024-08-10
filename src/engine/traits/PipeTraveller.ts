import { Vec2 } from "../math.js";
import { Trait } from "../Trait.js";

export class PipeTraveller extends Trait {
  direction = new Vec2(0, 0);
  movement = new Vec2(0, 0);
  distance = new Vec2(0, 0);
  constructor() {
    super();
  }
}
