// Import necessary dependencies
import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Level } from "../Level";
import { Trait } from "../Trait";

// Define a class named "Killable" that extends the "Trait" class
export class Killable extends Trait {
  dead = false; // Flag indicating if the entity is dead
  deadTime = 0; // Time since the entity died
  removeAfter = 2; // Time after which the entity should be removed

  // Method to kill the entity
  kill() {
    this.queue(() => {
      this.dead = true; // Set the entity as dead
    });
  }

  // Method to revive the entity
  revive() {
    this.dead = false; // Set the entity as alive
    this.deadTime = 0; // Reset the dead time
  }

  // Update method that takes an entity, game context, and level as parameters
  update(entity: Entity, { deltaTime }: GameContext, level: Level) {
    if (this.dead) {
      // If the entity is dead
      this.deadTime += deltaTime; // Update the dead time
      if (this.deadTime > this.removeAfter) {
        // If the dead time has exceeded the removal time
        this.queue(() => {
          level.entities.delete(entity); // Remove the entity from the level
        });
      }
    }
  }
}
