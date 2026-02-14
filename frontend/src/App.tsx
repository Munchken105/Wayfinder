import './index.css'; 
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LibraryFloorMap from './components/FloorsPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/floors" element={<LibraryFloorMap />} />
      </Routes>
    </div>
  );
}

export default App;