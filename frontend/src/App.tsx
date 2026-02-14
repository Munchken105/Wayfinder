import './index.css'; 
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Floor2Page from "./components/FloorsPage";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/floor2" element={<Floor2Page />} />
      </Routes>
    </div>
  );
}

export default App;