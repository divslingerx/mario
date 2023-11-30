import { Entity, Side } from "./Entity";
import { GameContext } from "./GameContext";
import { Level } from "./Level";
import { TileResolverMatch } from "./TileResolver";

type TraitTask = (...args: any[]) => void;

type TraitListener = {
  name: string | symbol;
  callback: () => void;
  count: number;
};

export class Trait {
  static EVENT_TASK = Symbol("task");
  private listeners: TraitListener[] = [];

  protected listen(
    name: string | symbol,
    callback: () => void,
    count = Infinity
  ) {
    const listener = { name, callback, count };
    this.listeners.push(listener);
  }

  finalize(entity: Entity) {
    this.listeners = this.listeners.filter((listener) => {
      entity.events.process(listener.name, listener.callback);
      return --listener.count;
    });
  }

  queue(task: TraitTask) {
    this.listen(Trait.EVENT_TASK, task, 1);
  }

  collides(us: Entity, them: Entity) {}
  obstruct(entity: Entity, side: Side, match: TileResolverMatch) {}
  update(entity: Entity, gameContext: GameContext, level: Level) {}
}
