import { useLocation } from 'react-router';
import AudioWaveform from '../components/AudioWaveform';

const Editor = () => {
	console.log('Editor component rendered');
	const location = useLocation();
	const audioDataFromUpload = location.state ? location.state.audioData : null;
    const transcriptDataFromUpload = location.state ? location.state.transcriptData : null;

	console.log('Audio Data before passing to AudioWaveform:', audioDataFromUpload);
    console.log('Transcript Data before passing to AudioWaveform:', transcriptDataFromUpload);

	return (
		<div>
			<h1 style={{ textAlign: 'center'}}>
				Edit Your Audio File
			</h1>
			{audioDataFromUpload  && (
				<AudioWaveform 
					key={audioDataFromUpload}
					audioData={audioDataFromUpload} 
					transcriptData={transcriptDataFromUpload} />
			)}
			{!audioDataFromUpload && <p style={{ textAlign: 'center' }}>Loading audio...</p>}
		</div>
	);
};

export default Editor;