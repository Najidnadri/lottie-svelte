// // Reexport your entry components here

export { default as LottieSvelte } from './LottieSvelte.svelte';

export type AnimationDirection = 1 | -1;

export enum PlayerState {
	Destroyed = "destroyed",
	Error = "error",
	Frozen = "frozen",
	Loading = "loading",
	Paused = "paused",
	Playing = "playing",
	Stopped = "stopped",
}

// Define play modes
export enum PlayMode {
	Bounce = "bounce",
	Normal = "normal",
}

// Define player events
export enum PlayerEvents {
	Complete = "complete",
	Destroyed = "destroyed",
	Error = "error",
	Frame = "frame",
	Freeze = "freeze",
	Load = "load",
	Loop = "loop",
	Pause = "pause",
	Play = "play",
	Ready = "ready",
	Rendered = "rendered",
	Stop = "stop",
}

export interface LottieSvelteInstance {
    getLottie: () => any;
    play: () => void;
    pause: () => void;
    stop: () => void;
    seek: (value: number | string) => void;
    snapshot: (download: boolean) => string | void;
    setSpeed: (value: number) => void;
    setDirection: (value: AnimationDirection) => void;
    setLooping: (value: boolean) => void;
    togglePlay: () => void;
    toggleLooping: () => void;
    resize: () => void;
}