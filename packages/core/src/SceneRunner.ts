import { GameContext } from "./GameContext";
import { Scene } from "./Scene";

export  class SceneRunner {
  public sceneIndex = -1;
  public scenes: Scene[] = [];

  addScene(scene: Scene) {
    scene.events.listen(Scene.EVENT_COMPLETE, () => {
      this.runNext();
    });
    this.scenes.push(scene);
  }

  runNext() {
    const currentScene = this.scenes[this.sceneIndex];
    if (currentScene) {
      currentScene.pause();
    }
    this.sceneIndex++;
  }

  update(gameContext: GameContext) {
    const currentScene = this.scenes[this.sceneIndex];
    if (currentScene) {
      currentScene.update(gameContext);
      currentScene.draw(gameContext);
    }
  }
}
