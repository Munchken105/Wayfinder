import './index.css'; 
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LibraryFloorMap from './components/FloorsPage';
import MobilePage from './components/MobilePage'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/floors" element={<LibraryFloorMap />} />
        <Route path="/mobile" element={<MobilePage/>}/>
        <Route path="*" element={<div>ROUTE NOT FOUND</div>} />
      </Routes>
    </div>
  );
}

export default App;