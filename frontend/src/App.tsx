import { useState, useEffect } from "react";
import "./App.css";
import HomePage from "./components/HomePage";
import Floor2Page from "./components/FloorsPage";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [handoffTarget, setHandoffTarget] = useState<string>("");

  // Check URL param for Handoff
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('dest');
    if (dest) {
      // If dest is present, we should switch to "floor2map" (or the view containing nav)
      // and inform it to start wayfinding.
      setHandoffTarget(dest);
      setCurrentPage("floor2map");
    }
  }, []);

  return (
    <div className="app">
      {currentPage === "home" && (
        <HomePage onStart={() => setCurrentPage("floor2map")} />
      )}
      {currentPage === "floor2map" && (
        <Floor2Page
          onBack={() => setCurrentPage("home")}
          initialTarget={handoffTarget}
        />
      )}
    </div>
  );
}

export default App;