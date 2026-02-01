import { useState, useRef, useEffect } from 'react';
import './SoundPlayer.css';

export default function SoundPlayer({ name, audioSrc, date, place }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);

  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  const FADE_TIME = 2.5; // seconds

  // Convert linear slider value to logarithmic gain value
  const linearToLog = (value) => {
    // Using exponential curve: value^2 for more natural perception
    return value * value;
  };

  useEffect(() => {
    audioContextRef.current =
      new (window.AudioContext || window.webkitAudioContext)();

    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.value = 0;
    gainNodeRef.current.connect(audioContextRef.current.destination);

    loadAudio();

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      audioContextRef.current?.close();
    };
  }, [audioSrc]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(audioSrc);
      const arrayBuffer = await response.arrayBuffer();
      audioBufferRef.current =
        await audioContextRef.current.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.error('Error loading audio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = () => {
    const ctx = audioContextRef.current;
    const buffer = audioBufferRef.current;

    if (!ctx || !buffer) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNodeRef.current);

    // Fade in
    const now = ctx.currentTime;
    gainNodeRef.current.gain.cancelScheduledValues(now);
    gainNodeRef.current.gain.setValueAtTime(0, now);
    gainNodeRef.current.gain.linearRampToValueAtTime(
      linearToLog(volume),
      now + FADE_TIME
    );

    source.start();
    sourceNodeRef.current = source;
  };

  const stopSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx || !sourceNodeRef.current) return;

    const now = ctx.currentTime;

    // Fade out
    gainNodeRef.current.gain.cancelScheduledValues(now);
    gainNodeRef.current.gain.setValueAtTime(
      gainNodeRef.current.gain.value,
      now
    );
    gainNodeRef.current.gain.linearRampToValueAtTime(
      0,
      now + FADE_TIME
    );

    // Stop after fade
    setTimeout(() => {
      sourceNodeRef.current?.stop();
      sourceNodeRef.current = null;
    }, FADE_TIME * 1000);
  };

  const togglePlay = () => {
    if (isPlaying) stopSound();
    else playSound();

    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.setTargetAtTime(
        linearToLog(newVolume),
        audioContextRef.current.currentTime,
        0.05
      );
    }
  };

  return (
    <div className="sound-player">
      <h3>{name}</h3>
      <div className="metadata">
        <span>{date}</span>
        <span className="separator">•</span>
        <span>{place}</span>
      </div>

      <div className="controls">
        <button
          onClick={togglePlay}
          className="play-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="3" width="4" height="14" fill="currentColor" />
              <rect x="12" y="3" width="4" height="14" fill="currentColor" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 3L17 10L5 17V3Z" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="volume-control">
          <label>Volume: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}
