/**
 * Utility helpers for cached audio playback.
 */

type AudioResource = {
  cache: HTMLAudioElement | null;
  isLoaded: boolean;
};

const TYPEWRITER_SRC = "/sounds/message-type.mp3";
const EXPLOSION_SRC = "/sounds/explosion.mp3";

const resources = new Map<string, AudioResource>();
const activeInstances = new Map<string, Set<HTMLAudioElement>>();

const ensureResource = (src: string): AudioResource => {
  let resource = resources.get(src);
  if (!resource) {
    resource = { cache: null, isLoaded: false };
    resources.set(src, resource);
  }
  return resource;
};

const ensureActiveSet = (src: string): Set<HTMLAudioElement> => {
  let set = activeInstances.get(src);
  if (!set) {
    set = new Set<HTMLAudioElement>();
    activeInstances.set(src, set);
  }
  return set;
};

const clampVolume = (volume: number): number => {
  return Math.max(0, Math.min(1, volume));
};

const preloadAudio = (src: string): void => {
  if (typeof window === "undefined") return;

  const resource = ensureResource(src);
  if (resource.cache) return;

  const audio = new Audio(src);
  audio.preload = "auto";

  audio.addEventListener(
    "canplaythrough",
    () => {
      resource.isLoaded = true;
    },
    { once: true },
  );

  audio.addEventListener("error", (event) => {
    console.warn(`Failed to load ${src}:`, event);
    resource.isLoaded = false;
  });

  resource.cache = audio;
};

if (typeof window !== "undefined") {
  preloadAudio(TYPEWRITER_SRC);
  preloadAudio(EXPLOSION_SRC);
}

const registerEndHandlers = (
  element: HTMLAudioElement,
  instances: Set<HTMLAudioElement>,
): void => {
  const cleanup = () => {
    instances.delete(element);
  };

  element.addEventListener("ended", cleanup, { once: true });
  element.addEventListener("error", cleanup, { once: true });
};

const playCachedSound = (src: string, volume: number): void => {
  if (typeof window === "undefined") return;

  const safeVolume = clampVolume(volume);
  const resource = ensureResource(src);
  const instances = ensureActiveSet(src);

  const startPlayback = (audio: HTMLAudioElement) => {
    audio.volume = safeVolume;
    instances.add(audio);
    registerEndHandlers(audio, instances);

    audio.play().catch((error) => {
      console.warn(`Failed to play ${src}:`, error);
      instances.delete(audio);
    });
  };

  if (!resource.cache || !resource.isLoaded) {
    preloadAudio(src);
    startPlayback(new Audio(src));
    return;
  }

  const clone = resource.cache.cloneNode() as HTMLAudioElement;
  startPlayback(clone);
};

const stopAllForSrc = (src: string): void => {
  const instances = activeInstances.get(src);
  if (!instances) return;

  instances.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  instances.clear();
};

export const playTypewriterSound = (volume: number = 0.3): void => {
  playCachedSound(TYPEWRITER_SRC, volume);
};

export const stopAllTypewriterSounds = (): void => {
  stopAllForSrc(TYPEWRITER_SRC);
};

export const playAnimalCrossingSound = (volume: number = 0.3): void => {
  playTypewriterSound(volume);
};

export const playExplosionSound = (volume: number = 0.7): void => {
  playCachedSound(EXPLOSION_SRC, volume);
};

export const cleanupAudioContext = (): void => {
  stopAllForSrc(TYPEWRITER_SRC);
  stopAllForSrc(EXPLOSION_SRC);

  resources.forEach((resource) => {
    if (resource.cache) {
      resource.cache.pause();
      resource.cache.src = "";
    }
    resource.cache = null;
    resource.isLoaded = false;
  });

  resources.clear();
  activeInstances.clear();
};
