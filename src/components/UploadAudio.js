import { useState, useEffect, useRef, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';
import { useNavigate } from 'react-router';

const UploadAudio = () => {
	const inputFile = useRef(null);
	const { setFileURL } = useContext(FileContext);
	const [file, setFile] = useState(null);
    const navigate = useNavigate();

	useEffect(() => {
		if (file) {
			setFileURL(file);
			navigate('/edit');
		}
	}, [file, setFileURL, navigate]);

	const handleButtonClick = () => {
		inputFile.current.click();
	};

	const handleFileUpload = (e) => {
		// console.log(file);
		setFile(URL.createObjectURL(e.target.files[0]));
	};

	return (
		<div className='upload-audio'>
			<i
				style={{ color: '#531A65' }}
				className='material-icons audio-icon'>
				library_music
			</i>
			<h1>Upload your audio file here</h1>
			<button className='upload-btn' onClick={handleButtonClick}>
				Upload
			</button>
			<input
				type='file'
				id='file'
				ref={inputFile}
				style={{ display: 'none' }}
				accept='audio/*'
				onChange={handleFileUpload}
			/>
		</div>
	);
};

export default UploadAudio;