// Import necessary dependencies
import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Trait } from "../Trait";
import { Jump } from "./Jump";

// Define a class named "Go" that extends the "Trait" class
export class Go extends Trait {
  // Define properties with default values
  dir = 0; // Direction of movement (-1 for left, 1 for right, 0 for no movement)
  acceleration = 400; // Acceleration value for movement
  distance = 0; // Distance traveled
  heading = 1; // Current heading (1 for right, -1 for left)
  dragFactor = 1 / 5000; // Drag factor for slowing down
  deceleration = 300; // Deceleration value for slowing down

  // Define an update method that takes an entity and game context as parameters
  update(entity: Entity, { deltaTime }: GameContext) {
    const absX = Math.abs(entity.vel.x); // Absolute value of horizontal velocity

    if (this.dir !== 0) {
      // If there is a movement direction
      entity.vel.x += this.acceleration * this.dir * deltaTime; // Update velocity based on acceleration and direction

      const jump = entity.getTrait(Jump); // Get the Jump trait of the entity
      if (jump) {
        if (jump.falling === false) {
          // If the entity is not falling
          this.heading = this.dir; // Update the heading to the current direction
        }
      } else {
        this.heading = this.dir; // If no Jump trait, update the heading to the current direction
      }
    } else if (entity.vel.x !== 0) {
      // If there is no movement direction but entity is still moving horizontally
      const decel = Math.min(absX, this.deceleration * deltaTime); // Calculate the deceleration amount
      entity.vel.x += -Math.sign(entity.vel.x) * decel; // Apply deceleration to velocity in the opposite direction
    } else {
      // If there is no movement direction and entity is not moving horizontally
      this.distance = 0; // Reset the distance traveled
    }
    const drag = this.dragFactor * entity.vel.x * absX; // Calculate the drag amount based on velocity
    entity.vel.x -= drag; // Apply drag to velocity

    this.distance += absX * deltaTime; // Update the distance traveled based on absolute velocity and time
  }
}
