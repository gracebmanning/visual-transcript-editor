import { Route, Routes } from 'react-router';
import './App.css';
import Home from './pages/Home';
import Editor from './pages/Editor';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/edit" element={<Editor/>} />
      </Routes>
    </div>
  );
}

export default App;
