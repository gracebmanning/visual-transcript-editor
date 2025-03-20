import React, { useState } from "react";
import AudioWaveformEditor from "./AudioWaveformEditor";
import { parseTranscript } from "./TranscriptParser";
import "./TranscriptEditor.css"; // Import CSS file

export default function TranscriptEditor() {
  const [jsonInput, setJsonInput] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [modifiedTranscript, setModifiedTranscript] = useState(null);
  const [jsonUploadProgress, setJsonUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setJsonUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      reader.onloadstart = () => setJsonUploadProgress(0);
      reader.onloadend = (e) => {
        setJsonInput(e.target.result);
        setJsonUploadProgress(100);
      };

      reader.readAsText(file);
    }
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioUploadProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setAudioUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 300);

      setAudioFile(file);
    }
  };

  const modifyJson = () => {
    const parsed = parseTranscript(jsonInput);
    if (parsed) {
      setTranscript(parsed);
    } else {
      alert("Invalid transcript format");
    }
  };

  const handleSaveTranscript = (updatedWords) => {
    setModifiedTranscript({ transcript: updatedWords });
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(modifiedTranscript, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "modified_transcript.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container">
      <h2>Transcript Editor</h2>

      {/* JSON Upload */}
      <label htmlFor="json-upload" className="label">
        Upload Transcript (JSON):
      </label>
      <input id="json-upload" type="file" accept=".json" onChange={handleJsonUpload} className="input" />
      {jsonUploadProgress > 0 && <progress value={jsonUploadProgress} max="100" className="progress" />}

      {/* Audio Upload */}
      <label htmlFor="audio-upload" className="label">
        Upload Audio File:
      </label>
      <input id="audio-upload" type="file" accept="audio/*" onChange={handleAudioUpload} className="input" />
      {audioUploadProgress > 0 && <progress value={audioUploadProgress} max="100" className="progress" />}

      <button onClick={modifyJson} className="button">
        Modify JSON
      </button>

      {transcript && audioFile && (
        <AudioWaveformEditor transcript={transcript} audioFile={audioFile} onUpdate={handleSaveTranscript} />
      )}

      {modifiedTranscript && (
        <div style={{ marginTop: "20px" }}>
          <h3>Modified JSON:</h3>
          <pre className="preformatted">{JSON.stringify(modifiedTranscript, null, 2)}</pre>
          <button onClick={downloadJson} className="button">
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
}
