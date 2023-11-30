import { Direction } from '../math';
import {Entity} from '../Entity';
import {Pipe} from '../traits/Pipe';
import {loadAudioBoard} from '../loaders/audio';
import { AudioBoard } from '../AudioBoard';

export async function loadPipePortal(audioContext: AudioContext) {
    const audio = await loadAudioBoard('pipe-portal', audioContext)
    return createFactory(audio);
}

function createFactory(audio: AudioBoard) {
    return function createPipePortal(props: { dir: keyof typeof Direction; }) {
        const pipe = new Pipe();
        pipe.direction.copy(Direction[props.dir]);
        const entity = new Entity();
        // TODO - This is gross. lets fix this.
        const extendedEntity = Object.assign(entity, {props: props, audio: audio});
        extendedEntity.props = props;
        extendedEntity.audio = audio;
        extendedEntity.size.set(24, 30);
        extendedEntity.addTrait(pipe);
        return extendedEntity;
    };
}
