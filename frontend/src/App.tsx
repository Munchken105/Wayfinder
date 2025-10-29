import { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage";
import Floor2Page from "./components/Floor2Page";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="app">
      {currentPage === "home" && (
        <HomePage onStart={() => setCurrentPage("navigation")} />
      )}
      {currentPage === "navigation" && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Navigation Page</h1>
          <p>Navigation functionality coming soon...</p>
          <button onClick={() => setCurrentPage("floor2map")}>Go to Floor 2</button>
          <button onClick={() => setCurrentPage("home")}>Back to Home</button>
          
        </div>
      )}
      {currentPage === "floor2map" && (
      <Floor2Page onBack={() => setCurrentPage("navigation")} />
      )}
    </div>
  );
}

export default App;