import QRCodePage from "./QRCodePage";
import { useState, useEffect } from "react";
import { useNavigation } from "../hooks/navigation"
import { FaWheelchair } from "react-icons/fa";

export default function WayfindPage({ room, useElevator, setUseElevator }: { room: string; useElevator: boolean; setUseElevator: (value: boolean) => void; }){
  const {
    navigationResult,
    findPath,
    loading,
    error
  } = useNavigation();

  const floorFromRoom = (room: string) => {
    const num = parseInt(room.replace(/\D/g, ""), 10);

    if (isNaN(num)) return "Floor 2";
    if (num < 100) return "Basement";
    if (num < 200) return "Floor 1";
    if (num < 300) return "Floor 2";
    if (num < 400) return "Floor 3";
    if (num < 500) return "Floor 4";
    return "Floor 5";
  };

  useEffect(() => { //calls useNavigation
    findPath("Main Entrance", room, useElevator);
  }, [room, useElevator]);

  return (
    <div>
      <h2>
        Navigating from Kiosk to {room}
      </h2>
      {loading && <div className="status">Computing path...</div>}
      {error && <div className="status error">Error: {error}</div>}

      {floorFromRoom(room) !== "Floor 2" && (
        <div className="toggle-boxes">
          <button className={`sidebar-box ${!useElevator ? "active" : ""}`} onClick={() => { setUseElevator(false); }}>Stairs</button>
          <button className={`sidebar-box ${useElevator ? "active" : ""}`} onClick={() => { setUseElevator(true); }}> 
            <FaWheelchair className="icon" />
             Elevator</button>
        </div>
      )}

      <div className="instructions">
        <ol>
          {navigationResult?.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="qr-container">
        <QRCodePage room={room} />
      </div>
    </div>
  )
}