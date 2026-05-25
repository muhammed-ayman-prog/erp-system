import {
  useEffect,
  useRef
} from "react";

export function useAudio(src) {

  const audioRef = useRef(null);

  useEffect(() => {

    const audio = new Audio(src);

    audio.preload = "auto";

    audioRef.current = audio;

    return () => {

      audio.pause();

      audio.src = "";

      audioRef.current = null;
    };

  }, [src]);

  const play = async () => {

    try {

      const audio = audioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.volume = 0.7;

      await audio.play();

    } catch (err) {

      console.error(
        "Audio playback failed:",
        err
      );
    }
  };

  return {
    play
  };
}