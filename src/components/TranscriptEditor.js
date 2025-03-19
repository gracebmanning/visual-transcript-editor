import React, { useState } from "react";
import AudioWaveformEditor from "./AudioWaveformEditor";
import { parseTranscript } from "./TranscriptParser";

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
        setJsonUploadProgress(100); // Fully loaded
      };

      reader.readAsText(file);
    }
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioUploadProgress(0);

      // Simulate upload progress (real-world case: use an API or FileReader)
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
    <div style={{ padding: "20px" }}>
      <h2>Transcript Editor</h2>

      {/* JSON Upload */}
      <input type="file" accept=".json" onChange={handleJsonUpload} />
      {jsonUploadProgress > 0 && (
        <progress value={jsonUploadProgress} max="100" style={{ display: "block", width: "100%" }} />
      )}

      {/* Audio Upload */}
      <input type="file" accept="audio/*" onChange={handleAudioUpload} />
      {audioUploadProgress > 0 && (
        <progress value={audioUploadProgress} max="100" style={{ display: "block", width: "100%" }} />
      )}

      <button onClick={modifyJson}>Modify JSON</button>

      {transcript && audioFile && (
        <AudioWaveformEditor transcript={transcript} audioFile={audioFile} onUpdate={handleSaveTranscript} />
      )}

      {modifiedTranscript && (
        <div>
          <h3>Modified JSON:</h3>
          <pre>{JSON.stringify(modifiedTranscript, null, 2)}</pre>
          <button onClick={downloadJson}>Download JSON</button>
        </div>
      )}
    </div>
  );
}
