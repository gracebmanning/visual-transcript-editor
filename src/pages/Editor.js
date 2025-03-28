import { useLocation } from 'react-router';
import AudioWaveform from '../components/AudioWaveform';

const Editor = () => {
	const location = useLocation();
    const transcriptDataFromUpload = location.state ? location.state.transcriptData : null;

	return (
		<div>
			<h1 style={{ textAlign: 'center'}}>
				Edit Your Audio File
			</h1>
			<AudioWaveform transcriptData={transcriptDataFromUpload} />
		</div>
	);
};

export default Editor;