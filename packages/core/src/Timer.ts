export  class Timer {
    private accumulatedTime: number = 0;
    private lastTime: number | null = null;
    private deltaTime: number;
    private updateProxy: (time: number) => void;

    constructor(deltaTime: number = 1/60) {
        this.deltaTime = deltaTime;

        this.updateProxy = (time: number) => {
            if (this.lastTime) {
                this.accumulatedTime += (time - this.lastTime) / 1000;

                if (this.accumulatedTime > 1) {
                    this.accumulatedTime = 1;
                }

                while (this.accumulatedTime > this.deltaTime) {
                    this.update(this.deltaTime);
                    this.accumulatedTime -= this.deltaTime;
                }
            }

            this.lastTime = time;

            this.enqueue();
        }
    }

    enqueue() {
        requestAnimationFrame(this.updateProxy);
    }

    start() {
        this.enqueue();
    }

    update(deltaTime: number) {
        // This method should be overridden by the subclass
        throw new Error("Update method not implemented.");
    }
}