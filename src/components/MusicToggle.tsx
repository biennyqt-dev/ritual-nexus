"use client";

import { useEffect, useRef, useState } from "react";

const MUSIC_STORAGE_KEY = "ritual-nexus:music-enabled";

export function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEnabled(window.localStorage.getItem(MUSIC_STORAGE_KEY) === "true");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    if (!enabled) {
      audio.pause();
      return;
    }

    audio.play().catch(() => {
      window.localStorage.setItem(MUSIC_STORAGE_KEY, "false");
      setEnabled(false);
    });
  }, [enabled]);

  function toggleMusic() {
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(MUSIC_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        className="music-toggle"
        aria-label={enabled ? "Turn background music off" : "Turn background music on"}
        aria-pressed={enabled}
        data-playing={enabled ? "true" : undefined}
        onClick={toggleMusic}
      >
        <span className="music-toggle__icon" aria-hidden="true">
          {enabled ? (
            <svg viewBox="0 0 24 24" role="img">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7" />
              <path d="M19 6a8 8 0 0 1 0 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" role="img">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              <path d="m17 9 4 4" />
              <path d="m21 9-4 4" />
            </svg>
          )}
        </span>
        <span className="music-toggle__text">{enabled ? "MUSIC ON" : "MUSIC OFF"}</span>
      </button>
      <audio ref={audioRef} src="/audio/ritual-nexus.mp3" preload="auto" loop />
    </>
  );
}
