import { Route, Routes } from 'react-router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Editor from './pages/Editor';


function App() {
  return (
    <div className="App">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/edit" element={<Editor/>} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
