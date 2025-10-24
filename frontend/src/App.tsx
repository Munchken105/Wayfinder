import { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage";

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
          <button onClick={() => setCurrentPage("home")}>Back to Home</button>
        </div>
      )}
    </div>
  );
}

export default App;