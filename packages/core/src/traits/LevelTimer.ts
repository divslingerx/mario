import { Entity } from "../Entity";
import { GameContext } from "../GameContext";
import { Level } from "../Level";
import { Trait } from "../Trait";

// Define a class named "LevelTimer" that extends the "Trait" class
export class LevelTimer extends Trait {
  // Define static event symbols
  static EVENT_TIMER_HURRY = Symbol("timer hurry");
  static EVENT_TIMER_OK = Symbol("timer ok");

  totalTime = 300; // Total time for the level
  currentTime = this.totalTime; // Current time remaining
  hurryTime = 100; // Time at which "hurry" event is emitted
  hurryEmitted?: boolean; // Flag indicating if "hurry" event has been emitted

  // Update method that takes an entity, game context, and level as parameters
  update(entity: Entity, { deltaTime }: GameContext, level: Level) {
    this.currentTime -= deltaTime * 2; // Update the current time based on deltaTime

    if (this.hurryEmitted !== true && this.currentTime < this.hurryTime) {
      // If "hurry" event has not been emitted and current time is less than hurry time
      level.events.emit(LevelTimer.EVENT_TIMER_HURRY); // Emit "hurry" event
      this.hurryEmitted = true; // Set the flag as true
    }

    if (this.hurryEmitted !== false && this.currentTime > this.hurryTime) {
      // If "hurry" event has been emitted and current time is greater than hurry time
      level.events.emit(LevelTimer.EVENT_TIMER_OK); // Emit "ok" event
      this.hurryEmitted = false; // Set the flag as false
    }
  }
}
