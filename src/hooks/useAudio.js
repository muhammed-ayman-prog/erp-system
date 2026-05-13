import { useEffect, useMemo } from "react";

export function useAudio(src) {

  const audio = useMemo(
    () => new Audio(src),
    [src]
  );

  useEffect(() => {

    return () => {

      audio.pause();

      audio.src = "";
    };

  }, [audio]);

  const play = () => {

    audio.currentTime = 0;

    audio.volume = 0.7;

    audio.play();
  };

  return {
    play
  };
}