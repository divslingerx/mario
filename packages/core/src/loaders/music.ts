import {loadJSON} from '../loaders';
import {MusicPlayer} from '../MusicPlayer';
import { MusicSpec } from '../types.js';

export async function loadMusicSheet(name: string) {
    const musicSheet = await loadJSON<MusicSpec>(`/music/${name}.json`);
    const musicPlayer = new MusicPlayer();
    for (const [name, track] of Object.entries(musicSheet)) {
        musicPlayer.addTrack(name, track.url);
    }
    return musicPlayer;
}
