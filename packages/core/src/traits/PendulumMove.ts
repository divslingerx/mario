// import { Entity, Side, Sides } from '../Entity'
// import { TileResolverMatch } from '../TileResolver.js';
// import { Trait } from '../Trait'


// export default class PendulumMove extends Trait {
//     public enabled = true
//     public speed = -30


//     obstruct(ent: Entity, side: Side) {
//         if (side === Sides.LEFT || side === Sides.RIGHT) {
//             this.speed = -this.speed;
//         }
//     }

//     update(entity: Entity) {
//         if (this.enabled) {
//             entity.vel.x = this.speed;
//         }
//     }
// }


import { Entity, Side } from '../Entity'
import { Trait } from '../Trait'

export class PendulumMove extends Trait {
  speed = -30
  enabled = true

  update(ent: Entity) {
    if (this.enabled) {
      ent.vel.x = this.speed
    }
  }

  obstruct(entity: Entity, side: Side) {
    if (side === Side.left) {
      this.speed = Math.abs(this.speed)
    } else if (side === Side.right) {
      this.speed = -Math.abs(this.speed)
    }
  }
}