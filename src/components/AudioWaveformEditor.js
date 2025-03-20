import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import "./AudioWaveformEditor.css";

export default function AudioWaveformEditor({ transcript, audioFile, onUpdate }) {
  const waveformRef = useRef(null);
  const waveSurfer = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wordPositions, setWordPositions] = useState([]);

  useEffect(() => {
    if (!audioFile) return;
  
    if (waveSurfer.current) {
      waveSurfer.current.destroy();
    }
  
    waveSurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "lightblue",
      progressColor: "blue",
      backend: "WebAudio",
      cursorWidth: 2,
      cursorColor: "blue",
      height: 200,
    });
  
    waveSurfer.current.load(URL.createObjectURL(audioFile));
  
    waveSurfer.current.on("ready", () => {
      setIsReady(true);
      setDuration(waveSurfer.current.getDuration());
  
      // 🛠 Check if transcript.words exists before mapping over it
      if (transcript && Array.isArray(transcript.words)) {
        setWordPositions(
          transcript.words.map((word) => ({
            text: word.text,
            time: word.startTime,
          }))
        );
      } else {
        setWordPositions([]); // Fallback to empty array if transcript is not formatted correctly
      }
    });
  
    waveSurfer.current.on("audioprocess", () => {
      setCurrentTime(waveSurfer.current.getCurrentTime());
    });
  
    waveSurfer.current.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
  
    return () => {
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
        waveSurfer.current = null;
      }
    };
  }, [audioFile, transcript]);
  

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

  const handleDrag = (e, index) => {
    e.preventDefault();
    const newX = e.clientX - waveformRef.current.getBoundingClientRect().left;
    const newTime = (newX / waveformRef.current.clientWidth) * duration;
    
    const updatedPositions = [...wordPositions];
    updatedPositions[index].time = Math.max(0, Math.min(newTime, duration));
  
    setWordPositions(updatedPositions);
  };

  const handleDragEnd = () => {
    onUpdate(wordPositions);
  };

  return (
    <div className="waveform-container">
      <h3>Waveform Editor</h3>
      <div ref={waveformRef} className="waveform" />

      {/* Line with draggable points */}
      <div className="word-line">
        {wordPositions.map((word, index) => (
          <div
            key={index}
            className="word-point"
            style={{ left: `${(word.time / duration) * 100}%` }}
            draggable
            onDrag={(e) => handleDrag(e, index)}
            onDragEnd={handleDragEnd}
            title={word.text}
          />
        ))}
      </div>

      {/* Scrub Bar */}
      <div className="progress-bar" onClick={handleSeek}>
        <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
      </div>

      {isReady ? <p>Audio Loaded!</p> : <p>Loading audio...</p>}

      {/* Play / Pause Button */}
      <button onClick={togglePlay} className="button" disabled={!isReady}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
