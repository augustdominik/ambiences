import { useState, useRef, useEffect } from 'react';
import './SoundPlayer.css';

export default function SoundPlayer({ name, audioSrc, date, place }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

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

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      audioContextRef.current?.close();
    };
  }, [audioSrc]);

  const loadAudio = async () => {
    if (hasLoaded) return;
    
    setIsLoading(true);
    setLoadProgress(0);
    
    try {
      const response = await fetch(audioSrc);
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      
      let loaded = 0;
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total) {
          setLoadProgress(Math.round((loaded / total) * 100));
        }
      }

      const arrayBuffer = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        arrayBuffer.set(chunk, position);
        position += chunk.length;
      }

      audioBufferRef.current =
        await audioContextRef.current.decodeAudioData(arrayBuffer.buffer);
      
      setHasLoaded(true);
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

    // Clear any pending fade-out timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
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
    const sourceToStop = sourceNodeRef.current;

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
    fadeTimeoutRef.current = setTimeout(() => {
      if (sourceNodeRef.current === sourceToStop) {
        sourceToStop?.stop();
        sourceNodeRef.current = null;
      }
      fadeTimeoutRef.current = null;
    }, FADE_TIME * 1000);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      stopSound();
      setIsPlaying(false);
    } else {
      if (!hasLoaded) {
        await loadAudio();
      }
      if (audioBufferRef.current) {
        playSound();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (gainNodeRef.current && isPlaying) {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      
      // Cancel any scheduled ramps (like fade-in) to prevent jitter
      gainNodeRef.current.gain.cancelScheduledValues(now);
      gainNodeRef.current.gain.setValueAtTime(
        gainNodeRef.current.gain.value,
        now
      );
      gainNodeRef.current.gain.linearRampToValueAtTime(
        linearToLog(newVolume),
        now + 0.1
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
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span className="load-percentage">{loadProgress}%</span>
            </div>
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
