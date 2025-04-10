import { useLocation, useNavigate } from 'react-router';
import AudioWaveform from '../components/AudioWaveform';
import { useEffect, useState } from 'react';

const Editor = () => {
	console.log('Editor component rendered');
	const location = useLocation();
	const navigate = useNavigate();
	const audioDataFromUpload = location.state ? location.state.audioData : null;
    const transcriptDataFromUpload = location.state ? location.state.transcriptData : null;
	const [isAudioURLAvailable, setIsAudioURLAvailable] = useState(false);

	useEffect(() => {
        if (audioDataFromUpload) {
            setIsAudioURLAvailable(true);
        } else {
            // Optionally, redirect back to the upload page if audioData is not available
            // navigate('/');
        }
    }, [audioDataFromUpload, navigate]);

	return (
		<div>
			<h1 style={{ textAlign: 'center'}}>
				Edit Your Audio File
			</h1>
			{isAudioURLAvailable && (
				<AudioWaveform 
					key={audioDataFromUpload}
					audioData={audioDataFromUpload} 
					transcriptData={transcriptDataFromUpload} />
			)}
			{!isAudioURLAvailable && <p style={{ textAlign: 'center' }}>Loading audio...</p>}
		</div>
	);
};

export default Editor;