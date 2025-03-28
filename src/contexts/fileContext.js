import { createContext, useState } from 'react';

const FileContext = createContext();

const FileContextProvider = ({ children }) => {
	const [audioFileURL, setAudioFileURL] = useState('');
	return (
		<FileContext.Provider value={{ audioFileURL, setAudioFileURL }}>
			{children}
		</FileContext.Provider>
	);
};

export { FileContext, FileContextProvider };