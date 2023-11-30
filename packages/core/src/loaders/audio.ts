import {AudioBoard} from '../AudioBoard.js';
import {loadJSON} from '../loaders.js';
import { SoundSpec } from '../types';

export async function loadAudioBoard(name: string, audioContext: AudioContext) {
    const loadAudio = createAudioLoader(audioContext);
    const audioSheet = await loadJSON<SoundSpec>(`/sounds/${name}.json`);
    const audioBoard = new AudioBoard();
    const fxAudioSheet = audioSheet.fx;
    await Promise.all(Object.keys(fxAudioSheet).map(async currFx => {
        const buffer = await loadAudio(fxAudioSheet[currFx].url);
        audioBoard.addAudio(currFx, buffer);
    }));
    return audioBoard;
}

export function createAudioLoader(context: AudioContext) {
    return async function loadAudio(url: string) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await context.decodeAudioData(arrayBuffer);
    }
}
