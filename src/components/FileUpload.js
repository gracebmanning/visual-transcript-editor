import { useState, useEffect, useRef, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';
import { useNavigate } from 'react-router';

const FileUpload = () => {
	const navigate = useNavigate();

    // Audio-related variables
    const audioInputFile = useRef(null);
    const { setAudioFileURL } = useContext(FileContext);
    const [audioData, setAudioData] = useState(null);

    // Transcript-related variables
    const transcriptInputFile = useRef(null); // New ref for transcript input
    const [transcriptData, setTranscriptData] = useState(null);
    const [transcriptError, setTranscriptError] = useState('');
   

	useEffect(() => {
        if (audioData) {
            setAudioFileURL(audioData);
            navigate('/edit', { state: { transcriptData } }); // Keep passing transcriptData
        }
    }, [audioData, setAudioFileURL, navigate, transcriptData]);

	// Handle audio file upload
    const handleAudioButtonClick = () => {
        audioInputFile.current.click();
    };

    const handleAudioFileUpload = (e) => {
        setAudioData(URL.createObjectURL(e.target.files[0]));
    };

    // Handle transcript file upload
    const handleTranscriptButtonClick = () => {
        transcriptInputFile.current.click();
    };

	const handleTranscriptFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setTranscriptError('');
        const allowedTypes = ['application/json', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setTranscriptError('Error: Only .json and .txt files are allowed.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            processTranscriptContent(content, file.type);
        };
        reader.onerror = () => {
            setTranscriptError('Error: Failed to read the uploaded transcript file.');
        };
        reader.readAsText(file);
    };

    const processTranscriptContent = (content, fileType) => {
        try {
            if (fileType === 'application/json') {
                const parsedData = JSON.parse(content);
                if (Array.isArray(parsedData) && parsedData.every(item => item.hasOwnProperty('word') && item.hasOwnProperty('start') && item.hasOwnProperty('end'))) {
                    setTranscriptData(parsedData);
                } else {
                    setTranscriptError('Error: JSON file should contain an array of transcript objects with "word", "start", and "end" keys.');
                }
            } else if (fileType === 'text/plain') {
                const lines = content.trim().split('\n');
                const processedData = lines.map(line => {
                    const [word, startStr, endStr] = line.split(/\s+/);
                    const start = parseFloat(startStr);
                    const end = parseFloat(endStr);
                    return { word: word?.trim(), start, end };
                }).filter(item => item.word && !isNaN(item.start) && !isNaN(item.end));
                setTranscriptData(processedData);
                if (processedData.length === 0 && lines.length > 0) {
                    setTranscriptError('Warning: Text file format might be incorrect. Ensure each line contains "word start end".');
                }
            }
        } catch (error) {
            console.error("Error parsing transcript:", error);
            setTranscriptError('Error: Could not parse the transcript file. Please check the format.');
        }
    };

	return (
		<div className='file-upload'> {/* Renamed class for consistency */}
            <i
                style={{ color: '#531A65' }}
                className='material-icons audio-icon'>
                library_music
            </i>
            <h1>Upload your audio file here</h1>
            <button className='upload-btn' onClick={handleAudioButtonClick}>
                Upload Audio
            </button>
            <input
                type='file'
                id='audioFile'
                ref={audioInputFile}
                style={{ display: 'none' }}
                accept='audio/*'
                onChange={handleAudioFileUpload}
            />

			<h1>Upload your transcript file here</h1>
            <button className='upload-btn' onClick={handleTranscriptButtonClick}>
                Upload Transcript
            </button>
            <input
                type="file"
				id="transcriptFile"
                accept=".json,.txt"
                ref={transcriptInputFile}
                style={{ display: 'none' }}
				onChange={handleTranscriptFileUpload}
            />
            {transcriptError && <p className="error-message" style={{ color: 'red' }}>{transcriptError}</p>}
        </div>
	);
};

export default FileUpload;