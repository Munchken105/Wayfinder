import QRCodePage from "./QRCodePage";
import { useEffect } from "react";
import { useNavigation } from "../hooks/navigation"

export default function WayfindPage({ room }: { room: string }){
  const {
    navigationResult,
    findPath,
    loading,
    error
  } = useNavigation();

  useEffect(() => { //calls useNavigation
    findPath("Main Entrance", room);
  }, [room]);

  return (
    <div>
      <h1>
        Navigating from Main Entrance to {room}
      </h1>
      {loading && <div className="status">Computing path...</div>}
      {error && <div className="status error">Error: {error}</div>}

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