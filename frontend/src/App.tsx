import { useState, useEffect } from "react";
import "./App.css";
import HomePage from "./components/HomePage";

interface Room {
  id: string;
  name: string;
  type: 'room' | 'hallway' | 'junction' | 'entrance';
  floor: number;
}

interface PathNode {
  id: string;
  name: string;
  type: 'room' | 'hallway' | 'junction' | 'entrance';
  floor: number;
}

interface NavigationResult {
  start: string;
  end: string;
  totalSteps: number;
  floor: string;
  path: PathNode[];
  instructions: string[];
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [startRoom, setStartRoom] = useState("");
  const [endRoom, setEndRoom] = useState("");
  const [navigationResult, setNavigationResult] = useState<NavigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available rooms when component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rooms");
      const data = await response.json();
      setRooms(data.rooms);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load available rooms");
    }
  };

  const findPath = async () => {
    if (!startRoom || !endRoom) {
      setError("Please select both start and end locations");
      return;
    }

    if (startRoom === endRoom) {
      setError("Start and end locations cannot be the same");
      return;
    }

    setLoading(true);
    setError("");
    setNavigationResult(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/navigation/from/${startRoom}/to/${endRoom}`
      );
      const data = await response.json();

      if (response.ok) {
        setNavigationResult(data);
      } else {
        setError(data.error || "Failed to find path");
      }
    } catch (err) {
      setError("Failed to connect to navigation service");
      console.error("Navigation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetNavigation = () => {
    setStartRoom("");
    setEndRoom("");
    setNavigationResult(null);
    setError("");
  };

  return (
    <div className="app">
      {currentPage === "home" && (
        <HomePage onStart={() => setCurrentPage("navigation")} />
      )}
      
      {currentPage === "navigation" && (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1>Building Navigation</h1>
            <p>Select your start and end locations to find the shortest path</p>
            <button 
              onClick={() => setCurrentPage("home")}
              style={{ marginBottom: "20px" }}
            >
              Back to Home
            </button>
          </div>

          {/* Location Selection Form */}
          <div style={{ 
            backgroundColor: "#f5f5f5", 
            padding: "20px", 
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  Start Location:
                </label>
                <select
                  value={startRoom}
                  onChange={(e) => setStartRoom(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
                >
                  <option value="">Select start location</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1", minWidth: "200px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
                  End Location:
                </label>
                <select
                  value={endRoom}
                  onChange={(e) => setEndRoom(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
                >
                  <option value="">Select end location</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={findPath}
                disabled={loading || !startRoom || !endRoom}
                style={{
                  padding: "10px 20px",
                  backgroundColor: loading ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Finding Path..." : "Find Path"}
              </button>
              
              <button 
                onClick={resetNavigation}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Reset
              </button>
            </div>

            {error && (
              <div style={{ 
                color: "red", 
                marginTop: "15px", 
                padding: "10px",
                backgroundColor: "#ffe6e6",
                borderRadius: "4px",
                textAlign: "center"
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Navigation Results */}
          {navigationResult && (
            <div style={{ 
              backgroundColor: "#e8f5e8", 
              padding: "20px", 
              borderRadius: "8px",
              border: "1px solid #4caf50"
            }}>
              <h2 style={{ color: "#2e7d32", marginBottom: "15px" }}>
                Navigation Result
              </h2>
              
              <div style={{ marginBottom: "15px" }}>
                <p><strong>Route:</strong> {navigationResult.start} → {navigationResult.end}</p>
                <p><strong>Total Steps:</strong> {navigationResult.totalSteps}</p>
                <p><strong>Floor:</strong> {navigationResult.floor}</p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ color: "#2e7d32", marginBottom: "10px" }}>Path:</h3>
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "5px",
                  marginBottom: "10px"
                }}>
                  {navigationResult.path.map((node: PathNode, index: number) => (
                    <span key={index} style={{ 
                      padding: "5px 10px",
                      backgroundColor: node.type === 'room' ? "#4caf50" : 
                                      node.type === 'entrance' ? "#ff9800" : "#2196f3",
                      color: "white",
                      borderRadius: "15px",
                      fontSize: "12px"
                    }}>
                      {node.name}
                      {index < navigationResult.path.length - 1 && " → "}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ color: "#2e7d32", marginBottom: "10px" }}>Step-by-Step Instructions:</h3>
                <ol style={{ paddingLeft: "20px" }}>
                  {navigationResult.instructions.map((instruction: string, index: number) => (
                    <li key={index} style={{ marginBottom: "8px" }}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Quick Examples removed by request */}
        </div>
      )}
    </div>
  );
}

export default App;