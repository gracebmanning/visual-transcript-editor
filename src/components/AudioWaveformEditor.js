import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioWaveformEditor({ transcript, audioFile, onUpdate }) {
  const waveformRef = useRef(null);
  const waveSurfer = useRef(null);
  const [words, setWords] = useState(transcript.transcript || []);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioFile) return;

    const timeout = setTimeout(() => {
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
      }

      waveSurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "lightblue",
        progressColor: "blue",
        backend: "WebAudio",
        cursorWidth: 2,
        cursorColor: "red"
      });

      waveSurfer.current.load(URL.createObjectURL(audioFile));

      waveSurfer.current.on("ready", () => {
        setIsReady(true);
        setDuration(waveSurfer.current.getDuration());
      });

      waveSurfer.current.on("audioprocess", () => {
        setCurrentTime(waveSurfer.current.getCurrentTime());
      });

      waveSurfer.current.on("finish", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      waveSurfer.current.on("error", (error) => {
        console.error("WaveSurfer error:", error);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
        waveSurfer.current = null;
      }
    };
  }, [audioFile]);

  const togglePlay = () => {
    if (!isReady) return;
    setIsPlaying(!isPlaying);
    waveSurfer.current.playPause();
  };

  const handleSeek = (e) => {
    const newTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    waveSurfer.current.setCurrentTime(newTime);
    setCurrentTime(newTime);
  };

  return (
    <div>
      <h3>Waveform Editor</h3>
      <div ref={waveformRef} style={{ width: "100%", height: "200px", background: "#eee" }} />

      {/* Play / Pause Button */}
      <button onClick={togglePlay} disabled={!isReady}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Scrub Bar */}
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#ddd",
          position: "relative",
          marginTop: "10px",
          cursor: "pointer"
        }}
        onClick={handleSeek}
      >
        <div
          style={{
            width: `${(currentTime / duration) * 100}%`,
            height: "100%",
            background: "blue"
          }}
        ></div>
      </div>

      {isReady ? <p>Audio Loaded!</p> : <p>Loading audio...</p>}
    </div>
  );
}
