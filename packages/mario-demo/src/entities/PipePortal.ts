import { Direction } from "../math";
import { Entity } from "../Entity";
import { Pipe } from "../traits/Pipe";
import { loadAudioBoard } from "../loaders/audio";
import { AudioBoard } from "../AudioBoard";

export async function loadPipePortal(audioContext: AudioContext) {
  const audio = await loadAudioBoard("pipe-portal", audioContext);
  const pipePortal = createFactory(audio);
  return pipePortal;
}

interface PortalProps {
  dir: keyof typeof Direction;
  goesTo: string;
}

function createFactory(audio: AudioBoard) {
  return function createPipePortal(props: PortalProps) {
    const pipe = new Pipe();
    pipe.goesTo.name = props.goesTo;
    pipe.direction.copy(Direction[props.dir]);
    const entity = new Entity();
    entity.audio = audio;
    entity.size.set(24, 30);
    entity.addTrait(pipe);
    return entity;
  };
}
