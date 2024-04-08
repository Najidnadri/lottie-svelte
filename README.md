# SvelteKit Lottie Web Player

![GitHub license](https://img.shields.io/github/license/Najidnadri/lottie-svelte)
![GitHub issues](https://img.shields.io/github/issues/Najidnadri/lottie-svelte)
![GitHub stars](https://img.shields.io/github/stars/Najidnadri/lottie-svelte)
![GitHub forks](https://img.shields.io/github/forks/Najidnadri/lottie-svelte)

SvelteKit Lottie Web Player is a lightweight and easy-to-use library for integrating Lottie animations into your SvelteKit applications. This library is SSR (Server-Side Rendering) safe, providing seamless integration with SvelteKit's SSR capabilities. With SvelteKit Lottie Web Player, you can effortlessly add engaging and dynamic animations to your SvelteKit projects.

# Features

- SSR (Server-Side Rendering) safe
- Easy integration with SvelteKit projects
- Lightweight and efficient
- Support for Lottie animations in JSON format
- Customizable animation playback options

# Installation
To install SvelteKit Lottie Web Player, use your preferred package manager:
```bash
npm install lottie-svelte
# or
yarn add lottie-svelte
# or
pnpm install lottie-svelte
```

# Usage
1. Import the `LottieSvelte` component into your SvelteKit component:

```html
<script>
import { LottieSvelte } from 'lottie-svelte';
</script>
```

2. Use the `LottieSvelte` component in your SvelteKit template, providing the path to your Lottie animation file:

```svelte
<!-- external -->
<LottiePlayer src="/path/to/your/animation.json" />

<!-- imported src -->
<script>
import MyLottieJSON from "$lib/assets/my-lottie.json"
</script>
<LottieSvelte
  src={MyLottieJSON}
  autoplay={true}
  loop={true}
  speed={1.5}
/>
```

3. Customize the animation playback options using component props:

```svelte
<LottieSvelte
  src="/path/to/your/animation.json"
  autoplay={true}
  loop={true}
  speed={1.5}
/>
```

4. Controls the animation by binding `this`
```svelte
<script lang="ts">
import { LottieSvelte, type LottieSvelteInstance } from 'lottie-svelte';

let lottieSvelte: LottieSvelteInstance;

onMounted(() => {
    setTimeout(() => {
        lottieSvelte?.pause()
    }, 500)
})
</script>

<LottieSvelte
    ...
    bind:this={lottieSvelte}
/>
```

# Props

- `src` (String | Object, required): The path to the Lottie animation JSON file.
- `autoplay` (Boolean, optional, default: `true`): Whether the animation should start playing automatically.
- `background` (String, optional, default: `"transparent"`): Background color of the player container.
- `controls` (Boolean, optional, default: `false`): Whether to display playback controls.
- `count` (Number | undefined, optional, default: `undefined`): Number of times to play the animation (overrides loop).
- `description` (String, optional, default: `"Lottie animation"`): Description of the animation for accessibility.
- `direction` (1 | -1, optional, default: `1`): Direction of the animation playback (1 for forward, -1 for backward).
- `disableCheck` (Boolean, optional, default: `false`): Whether to disable the animation size check.
- `disableShadowDOM` (Boolean, optional, default: `false`): Whether to disable the Shadow DOM.
- `hover` (Boolean, optional, default: `false`): Whether to pause the animation on hover.
- `intermission` (Number, optional, default: `1`): Delay in milliseconds before the animation starts.
- `loop` (Boolean, optional, default: `false`): Whether the animation should loop.
- `mode` (`PlayMode`, optional, default: `PlayMode.Normal`): Playback mode of the animation.
- `preserveAspectRatio` (String, optional, default: `"xMidYMid meet"`): Aspect ratio preservation for the animation.
- `renderer` ("svg", optional, default: `"svg"`): Renderer type for the animation.
- `viewBoxSize` (String | undefined, optional, default: `undefined`): Size of the viewBox for the animation.
- `speed` (Number, optional, default: `1`): The playback speed of the animation.
- `webworkers` (Boolean, optional, default: `false`): Whether to use web workers for rendering.
- `containerClass` (String, optional, default: `""`): Custom CSS class for the player container.
- `animationClass` (String, optional, default: `""`): Custom CSS class for the animation element.

# Methods

- `getLottie: () => any;`
- `play: () => void;`
- `pause: () => void;`
- `stop: () => void;`
- `seek: (value: number | string) => void;`
- `snapshot: (download: boolean) => string | void;`
- `setSpeed: (value: number) => void;`
- `setDirection: (value: AnimationDirection) => void;`
- `setLooping: (value: boolean) => void;`
- `togglePlay: () => void;`
- `toggleLooping: () => void;`
- `resize: () => void;`

# Emitted Events
```ts
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
```

# Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

# License

This project is licensed under the MIT License.
