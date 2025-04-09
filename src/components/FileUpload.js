import { useState, useRef, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';
import { useNavigate } from 'react-router';

const FileUpload = () => {
    const navigate = useNavigate();

    // Audio-related variables
    const audioInputFile = useRef(null);
    const { setAudioFileURL } = useContext(FileContext);
    const [audioData, setAudioData] = useState(null);
    const [isAudioUploaded, setIsAudioUploaded] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);

    // Transcript-related variables
    const transcriptInputFile = useRef(null);
    const [transcriptData, setTranscriptData] = useState(null);
    const [transcriptError, setTranscriptError] = useState('');
    const [isTranscriptUploaded, setIsTranscriptUploaded] = useState(false);
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

    // Handle audio file upload
    const handleAudioButtonClick = () => {
        audioInputFile.current.click();
    };

    const handleAudioFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsAudioLoading(true);
            setAudioData(URL.createObjectURL(file));
            setIsAudioUploaded(true);
            setIsAudioLoading(false);
        } else {
            setIsAudioUploaded(false);
            setIsAudioLoading(false);
        }
    };

    // Handle transcript file upload
    const handleTranscriptButtonClick = () => {
        transcriptInputFile.current.click();
    };

    const handleTranscriptFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setIsTranscriptUploaded(false);
            setIsTranscriptLoading(false);
            return;
        }
        setIsTranscriptLoading(true);
        setTranscriptError('');
        const allowedTypes = ['application/json', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            setTranscriptError('Error: Only .json and .txt files are allowed.');
            setIsTranscriptUploaded(false);
            setIsTranscriptLoading(false);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const processed = processTranscriptContent(content, file.type);
            if (processed) {
                setIsTranscriptUploaded(true);
            } else {
                setIsTranscriptUploaded(false);
            }
            setIsTranscriptLoading(false);
        };
        reader.onerror = () => {
            setTranscriptError('Error: Failed to read the uploaded transcript file.');
            setIsTranscriptUploaded(false);
            setIsTranscriptLoading(false);
        };
        reader.readAsText(file);
    };

    const processTranscriptContent = (content, fileType) => {
        try {
            if (fileType === 'application/json') {
                const parsedData = JSON.parse(content);
                if (Array.isArray(parsedData) && parsedData.every(item => item.hasOwnProperty('word') && item.hasOwnProperty('start') && item.hasOwnProperty('end'))) {
                    setTranscriptData(parsedData);
                    return true;
                } else {
                    setTranscriptError('Error: JSON file should contain an array of transcript objects with "word", "start", and "end" keys.');
                    return false;
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
                return processedData.length > 0;
            }
        } catch (error) {
            console.error("Error parsing transcript:", error);
            setTranscriptError('Error: Could not parse the transcript file. Please check the format.');
            return false;
        }
        return false;
    };

    const handleEditButtonClick = () => {
        if (!audioData || !transcriptData) {
            alert('Please upload both an audio file and a transcript file.'); // Improved error message
            return;
        }
        setAudioFileURL(audioData);
        navigate('/edit', { state: { transcriptData } });
    };

    return (
        <div className='file-upload'>
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
            {isAudioLoading && <p>Loading audio...</p>}
            {isAudioUploaded && !isAudioLoading && <p style={{ color: 'green' }}>Audio Uploaded!</p>}
			<br/>
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
            {isTranscriptLoading && <p>Loading transcript...</p>}
            {isTranscriptUploaded && !isTranscriptLoading && <p style={{ color: 'green' }}>Transcript Uploaded!</p>}
			<br/>
			<hr style={{ width: "50%", height: 2, color: "var(--color-primary)", backgroundColor: "var(--color-primary)" }} />
            {transcriptError && <p className="error-message" style={{ color: 'red' }}>{transcriptError}</p>}

            {isAudioUploaded && isTranscriptUploaded && (
                <button className='upload-btn' style={{ marginTop: '20px' }} onClick={handleEditButtonClick}>
                    Edit
                </button>
            )}
        </div>
    );
};

export default FileUpload;