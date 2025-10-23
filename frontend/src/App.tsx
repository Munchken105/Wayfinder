import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendMessage, setBackendMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then((text) => setBackendMessage(text))
      .catch(() => setBackendMessage("Error: Failed to reach backend"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Hello World! (Frontend)</h1>
      <p>{backendMessage}</p>
    </div>
  );
}

export default App;