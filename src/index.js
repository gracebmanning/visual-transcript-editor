import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router';
import { FileContextProvider } from './contexts/fileContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FileContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FileContextProvider>
  </React.StrictMode>
);
