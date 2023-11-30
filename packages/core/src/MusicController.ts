import { MusicPlayer } from "./MusicPlayer";

export default class MusicController {
  public player: MusicPlayer | null = null;

  setPlayer(player:MusicPlayer) {
    this.player = player;
  }

  playTheme(speed = 1) {
    const audio = this.player?.playTrack("main");
    if(!audio) {
        console.warn('No audio player found for Main');
        return 
    };

    audio.playbackRate = speed;
  }

  playHurryTheme() {
    const audio = this.player?.playTrack("hurry");
    if(!audio) return; 

    audio.loop = false;
    audio.addEventListener(
      "ended",
      () => {
        this.playTheme(1.3);
      },
      { once: true }
    );
  }

  pause() {
    this.player?.pauseAll();
  }
}
