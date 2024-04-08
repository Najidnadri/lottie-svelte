<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import { BROWSER as browser } from 'esm-env';
import "./assets/index.css"
import { PlayMode, PlayerEvents, PlayerState, type AnimationDirection } from "./index.js";

type AnimationItem = any;

export let autoplay: boolean = true
export let background: string = "transparent";
export let controls: boolean = false;
export let count: number | undefined = undefined;
export let currentState: PlayerState = PlayerState.Loading;
export let description: string = "Lottie animation";
export let direction: 1 | -1 = 1;
export let disableCheck: boolean = false;
export let disableShadowDOM: boolean = false;
export let hover: boolean = false;
export let intermission: number = 1;
export let loop: boolean = false;
export let mode: PlayMode = PlayMode.Normal;
export let preserveAspectRatio: string = "xMidYMid meet";
export let renderer: "svg" = "svg";
export let viewBoxSize: string | undefined = undefined;
export let seeker: number | null = null;
export let speed: number = 1;
export let src: string | Object;
export let webworkers: boolean = false;
export let containerClass: string = "";
export let animationClass: string = "";
let lottie: AnimationItem = undefined;

export const getLottie = () => {
    return _lottie
}

/**
 * Start playing animation.
 */
export const play = () => {
    if (!lottie) {
        return;
    }

    _lottie?.play();
    currentState = PlayerState.Playing;
    dispatch(PlayerEvents.Play);
}

/**
 * Pause animation play.
 */
export const pause = () => {
    if (!lottie) {
        return;
    }

    _lottie?.pause()
    currentState = PlayerState.Paused;
    dispatch(PlayerEvents.Pause);
}

/**
 * Stops animation play.
 */
export const stop = () => {
    if (!lottie) {
        return;
    }

    _counter = 1;
    _lottie?.stop();
    currentState = PlayerState.Stopped;
    dispatch(PlayerEvents.Stop);
}

/**
 * Seek to a given frame.
 */
export const seek = (value: number | string) => {
    if (!lottie) {
        return;
    }

    const matches = /^(\d+)(%?)$/.exec(value.toString());
    if (!matches) {
      return;
    }

    const frame =
      matches[2] === "%"
        ? (_lottie!.totalFrames * Number(matches[1])) / 100
        : Number(matches[1]);

    seeker = frame;

    if (currentState === PlayerState.Playing) {
      _lottie!.goToAndPlay(frame, true);
    } else {
      _lottie!.goToAndStop(frame, true);
      _lottie!.pause();
    }
}

/**
 * Snapshot the current frame as SVG.
 *
 * If 'download' argument is boolean true, then a download is triggered in browser.
 */
export const snapshot  = (download: boolean = true): string | void => {
    if (!shadowRoot || !browser || !isReady) return;

    // Get SVG element and serialize markup
    const animationEl = shadowRoot.getElementsByClassName("animation")
    if (!animationEl || animationEl.length === 0) {
        return;
    }
    const svgEl = animationEl[0].getElementsByTagName("svg");
    if (!svgEl || svgEl.length === 0) {
        return;
    }
    const svgElement = svgEl[0] as Node;
    const data = new XMLSerializer().serializeToString(svgElement);

    // Trigger file download
    if (download) {
        const element = document.createElement("a");
        element.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            data
        )}`;
        element.download = `download_${seeker}.svg`;
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    return data;
}

/**
 * Sets animation play speed.
 *
 * @param value Playback speed.
 */
export const setSpeed = (value = 1): void => {
    if (!_lottie) {
        return;
    }

    _lottie.setSpeed(value);
}

/**
 * Animation play direction.
 *
 * @param value Direction values.
 */
export const setDirection = (value: AnimationDirection) => {
    if (!_lottie) {
        return;
    }
    
    _lottie.setDirection(value);
}

/**
 * Sets the looping of the animation.
 *
 * @param value Whether to enable looping. Boolean true enables looping.
 */
export const setLooping = (value: boolean) => {
    if (_lottie) {
        loop = value;
        _lottie.loop = value;
    }
}

/**
 * Toggle playing state.
 */
export const togglePlay = () => {
    return currentState === PlayerState.Playing
    ? pause()
    : play();
}

/**
 * Toggles animation looping.
 */
export const toggleLooping = (): void => {
    setLooping(!loop);
}


/**
 * Resize animation.
 */
export const resize = () => {
    if (!_lottie) {
        return;
    }

    _lottie.resize();
}

/**
 * Returns the styles for the component.
 */
export const styles = () => {
    //return styles;
}



let _io: IntersectionObserver | undefined = undefined;
let _lottie: AnimationItem | undefined = undefined;
let _prevState: any | undefined = undefined;
let _counter: number = 1;
let container: HTMLElement;
let shadowRoot: HTMLElement;
let isReady: boolean = false;
const dispatch = createEventDispatcher()

const load = async (src: string | Object) => {
    const options: any = {
        container: container,
        loop: false,
        autoplay: false,
        renderer: renderer,
        rendererSettings: {
            preserveAspectRatio: preserveAspectRatio,
            clearCanvas: false,
            progressiveLoad: true,
            hideOnTransparent: true,
            ...(viewBoxSize && { viewBoxSize: viewBoxSize }),
        },
    };

    try {
        const srcParsed = parseSrc(src);
        let jsonData = {};
        let srcAttrib = typeof srcParsed === "string" ? "path" : "animationData";

        // Clear previous animation, if any
        if (_lottie) {
            _lottie.destroy();
        }

        if (webworkers) {
            lottie.useWebWorker(true);
        }

        // Initialize lottie player and load animation
        _lottie = lottie.default.loadAnimation({
            ...options,

            [srcAttrib]: srcParsed,
        });

        // Attach the event listeners before we check the requested json file for errors
        _attachEventListeners();

        if (!disableCheck) {
            // Fetch resource if src is a remote URL
            if (srcAttrib === "path") {
                jsonData = await fromURL(srcParsed as string);
                srcAttrib = "animationData";
            } else {
                jsonData = srcParsed;
            }

            if (!isLottie(jsonData)) {
                currentState = PlayerState.Error;
                dispatch(PlayerEvents.Error);
            }
        }
    } catch (err) {
        currentState = PlayerState.Error;
        dispatch(PlayerEvents.Error);
    }
}

/**
 * Handle visibility change events.
 */
const _onVisibilityChange = (): void => {
    if (document.hidden === true && currentState === PlayerState.Playing) {
        freeze();
    } else if (currentState === PlayerState.Frozen) {
        play();
    }
}

/**
 * Handles click and drag actions on the progress track.
 */
const _handleSeekChange = (e: any): void => {
    if (!_lottie || isNaN(e.target.value)) {
        return;
    }

    const frame: number = (e.target.value / 100) * _lottie.totalFrames;

    seek(frame);
}

/**
 * Freeze animation play.
 * This internal state pauses animation and is used to differentiate between
 * user requested pauses and component instigated pauses.
 */
const freeze = (): void => {
    if (!_lottie) {
    return;
    }

    _lottie.pause();
    currentState = PlayerState.Frozen;

    dispatch(PlayerEvents.Freeze);
}



const _attachEventListeners = (): void => {
    if (!lottie) return;

    _lottie!.addEventListener("enterFrame", () => {
        seeker = (_lottie!.currentFrame / _lottie!.totalFrames) * 100;

        dispatch(PlayerEvents.Frame, {
            frame: _lottie!.currentFrame,
            seeker: seeker,
        });
    });

    // Handle animation play complete
    _lottie!.addEventListener("complete", () => {
        if (currentState !== PlayerState.Playing) {
            dispatch(PlayerEvents.Complete);
            return;
        }

        if (!loop || (count && _counter >= count)) {
            dispatch(PlayerEvents.Complete);

            if (mode === PlayMode.Bounce) {
                if (_lottie!.currentFrame === 0) {
                    return;
                }
            } else {
                return;
            }
        }

        if (mode === PlayMode.Bounce) {
            if (count) {
                _counter += 0.5;
            }

            setTimeout(() => {
                dispatch(PlayerEvents.Loop);

                if (currentState === PlayerState.Playing) {
                    const direction = _lottie!.playDirection
                    _lottie!.setDirection((direction * -1) as AnimationDirection);
                    _lottie!.play();
                }
            }, intermission);
        } else {
            if (count) {
                _counter += 1;
            }

            window.setTimeout(() => {
                dispatch(PlayerEvents.Loop);

                if (currentState === PlayerState.Playing) {
                    if (direction === -1) {
                        // Prevents flickering
                        seek("99%");
                        play();
                    } else {
                        _lottie!.stop();
                        _lottie!.play();
                    }
                }
            }, intermission);
        }
    });

    // Handle lottie-web ready event
    _lottie!.addEventListener("DOMLoaded", () => {
        // Set initial playback speed and direction
        setSpeed(speed);
        setDirection(direction);

        // Start playing if autoplay is enabled
        if (autoplay) {
            if (direction === -1) seek("100%");
            play();
        }

        isReady = true;
        dispatch(PlayerEvents.Ready);
        

        // Handle animation data load complete
        _lottie!.addEventListener("data_ready", () => {
            dispatch(PlayerEvents.Load);
        });


        // Set error state when animation load fail event triggers
        _lottie!.addEventListener("data_failed", () => {
            currentState = PlayerState.Error;

            dispatch(PlayerEvents.Error);;
        });

        // Set handlers to auto play animation on hover if enabled
        container.addEventListener("mouseenter", () => {
            if (hover && currentState !== PlayerState.Playing) {
                play();
            }
        });
        container.addEventListener("mouseleave", () => {
            if (hover && currentState === PlayerState.Playing) {
                stop();
            }
        });
    });
}

/**
 * Parse a resource into a JSON object or a URL string
 */
function parseSrc(src: string | object): string | object {
    if (typeof src === "object") {
        return src;
    }

    try {
        return JSON.parse(src);
    } catch (e) {
        // Try construct an absolute URL from the src URL
        const srcUrl: URL = new URL(src, window.location.href);

        return srcUrl.toString();
    }
}

function isLottie(json: Record<string, any>): boolean {
    const mandatory: string[] = ["v", "ip", "op", "layers", "fr", "w", "h"];

    return mandatory.every((field: string) =>
        Object.prototype.hasOwnProperty.call(json, field)
    );
}

async function fromURL(url: string): Promise<Record<string, any>> {
    if (typeof url !== "string") {
        throw new Error(`The url value must be a string`);
    }

    let json;

    try {
        // Try construct an absolute URL from the src URL
        const srcUrl: URL = new URL(url);

        // Fetch the JSON file from the URL
        const result: any = await fetch(srcUrl.toString());

        json = await result.json();
    } catch (err) {
        throw new Error(
            `An error occurred while trying to load the Lottie file from URL`
        );
    }

    return json;
}

$: {
    if (browser && src && lottie) {   
        load(src);
    }
}

onMount(async () => {
    if (browser) {
        lottie = await import('lottie-web/build/player/lottie.js');
    }   
})

onDestroy(() => {
    if (!_lottie) {
        return
    }

    // Remove intersection observer for detecting component being out-of-view.
    if (_io) {
        _io.disconnect();
        _io = undefined;
    }

    if (browser) {
        // Remove the attached Visibility API's change event listener.
        document.removeEventListener("visibilitychange", _onVisibilityChange);
    }

    _lottie.destroy();
    _lottie = undefined;
    currentState = PlayerState.Destroyed;
    dispatch(PlayerEvents.Destroyed);
})

</script>

<div 
    id="animation-container"
    class={containerClass}
    lang="en"
    aria-label={description}
    role="img" 
    bind:this={shadowRoot}
>
    <div
        bind:this={container}
        id="animation"
        class={animationClass + " animation"}
        style="background:${background};"
    >
        {#if currentState === PlayerState.Error}
            <div class="error">⚠️</div>
        {/if}
    </div>
    {#if controls && !disableShadowDOM}
    <div
        id="lottie-controls"
        aria-label="lottie-animation-controls"
        class="toolbar"
    >
        <button
            id="lottie-play-button"
            on:click={togglePlay}
            class={currentState === PlayerState.Playing || currentState === PlayerState.Paused ? "active" : ""}
            style="align-items:center;"
            tabindex="0"
            aria-label="play-pause"
        >
            {#if currentState === PlayerState.Playing}
            <svg
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z"
                />
            </svg>
            {:else}
            <svg
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
            </svg>
            {/if}
        </button>
        <button
            id="lottie-stop-button"
            on:click={stop}
            class={currentState === PlayerState.Stopped ? "active" : ""}
            style="align-items:center;"
            tabindex="0"
            aria-label="stop"
        >
        <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M6 6h12v12H6V6z" />
        </svg>
        </button>
            <!-- svelte-ignore a11y-no-redundant-roles -->
            <input
                id="lottie-seeker-input"
                class="seeker"
                type="range"
                min="0"
                step="1"
                max="100"
                bind:value={seeker}
                on:input={_handleSeekChange}
                on:mousedown={() => {
                    _prevState = currentState;
                    freeze();
                }}
                on:mouseup={() => {
                    _prevState === PlayerState.Playing && play();
                }}
                aria-valuemin="1"
                aria-valuemax="100"
                role="slider"
                aria-valuenow={seeker}
                tabindex="0"
                aria-label="lottie-seek-input"
            />
        <button
            id="lottie-loop-toggle"
            on:click={toggleLooping}
            class={loop ? "active" : ""}
            style="align-items:center;"
            tabindex="0"
            aria-label="loop-toggle"
        >
            <svg width="24" height="24" aria-hidden="true" focusable="false">
                <path
                    d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
                />
            </svg>
        </button>
    </div>
    {/if}
</div>