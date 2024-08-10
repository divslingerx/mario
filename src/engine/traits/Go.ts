import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Trait } from "../Trait";
import { Jump } from "./Jump";

export class Go extends Trait {
  dir = 0;
  acceleration = 400;
  distance = 0;
  heading = 1;
  dragFactor = 1 / 5000;
  deceleration = 300;

  update(entity: Entity, { deltaTime }: GameContext) {
    // Calculate the absolute value of the entity's velocity on the x-axis
    const absX = Math.abs(entity.vel.x);

    // Check if there is a directional input
    if (this.dir !== 0) {
      // Apply acceleration to the entity's velocity based on the direction and deltaTime
      entity.vel.x += this.acceleration * this.dir * deltaTime;

      // Get the Jump trait of the entity
      const jump = entity.getTrait(Jump);

      if (jump) {
        // If the entity is not falling, set the heading to the current direction
        if (jump.falling === false) {
          this.heading = this.dir;
        }
      } else {
        // If the entity does not have a Jump trait, set the heading to the current direction
        this.heading = this.dir;
      }
    } else if (entity.vel.x !== 0) {
      // If there is no directional input and the entity is moving, apply deceleration
      const decel = Math.min(absX, this.deceleration * deltaTime);
      entity.vel.x += -Math.sign(entity.vel.x) * decel;
    } else {
      // If there is no directional input and the entity is not moving, reset the distance
      this.distance = 0;
    }

    // Apply drag to the entity's velocity
    const drag = this.dragFactor * entity.vel.x * absX;
    entity.vel.x -= drag;

    // Update the distance traveled by the entity
    this.distance += absX * deltaTime;
  }
}
