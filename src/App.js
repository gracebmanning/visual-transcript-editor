import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Editor from './pages/Editor';
import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path="/" element={<FileUpload/>} />
        <Route path="/edit" element={<Editor/>} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
