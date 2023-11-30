const PRESSED = 1;
const RELEASED = 0;

type KeyState = typeof PRESSED | typeof RELEASED;
type KeyCode = string;
type KeyCallback = (keyState: KeyState) => void;

export default class KeyboardState {
    private keyStates: Map<KeyCode, KeyState>;
    private keyMap: Map<KeyCode, KeyCallback>;

    constructor() {
        // Holds the current state of a given key
        this.keyStates = new Map();

        // Holds the callback functions for a key code
        this.keyMap = new Map();
    }

    addMapping(code: KeyCode, callback: KeyCallback): void {
        this.keyMap.set(code, callback);
    }

    handleEvent(event: KeyboardEvent): void {
        const {code} = event;

        if (!this.keyMap.has(code)) {
            // Did not have key mapped.
            return;
        }

        event.preventDefault();

        const keyState: KeyState = event.type === 'keydown' ? PRESSED : RELEASED;

        if (this.keyStates.get(code) === keyState) {
            return;
        }

        this.keyStates.set(code, keyState);

        this.keyMap.get(code)!(keyState);
    }

    listenTo(window: Window): void {
        ['keydown', 'keyup'].forEach(eventName => {
            window.addEventListener(eventName, event => {
                this.handleEvent(event as KeyboardEvent);
            });
        });
    }
}