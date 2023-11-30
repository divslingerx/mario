

export  class AudioBoard {
    buffers: Map<string, AudioBuffer>;
    constructor() {
        this.buffers = new Map<string, AudioBuffer>();
    }

    addAudio(name: string, buffer: AudioBuffer) {
        this.buffers.set(name, buffer);
    }

    playAudio(name: string, context: AudioContext) {
        const source = context.createBufferSource();
        source.connect(context.destination);
        const buffToPlayer = this.buffers.get(name);
        if(!buffToPlayer) {
            throw new Error(`No audio buffer named ${name}`);
        }
        source.buffer = buffToPlayer
        source.start(0);
    }
}
