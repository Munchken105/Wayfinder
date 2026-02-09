import QRCodePage from "./QRCodePage";
import { useEffect } from "react";
import { useNavigation } from "../hooks/navigation"

export default function WayfindPage({ room }: { room: string }) {
  const {
    navigationResult,
    loading,
    error,
    findPath,
  } = useNavigation();

  useEffect(() => { //calls useNavigation
    // Hardcoded Start for now as per prompt "Kiosk"
    const startNode = "C235"; // Main Entrance/Kiosk
    findPath(startNode, room);
  }, [room]);


  return (
    <div style={{ padding: '10px' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#005bbb' }}>Navigation Analysis</h3>

      {loading && <div>Finding route...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {navigationResult && (
        <>
          <div className="from-and-to" style={{ fontSize: '0.9rem', marginBottom: '10px', fontStyle: 'italic' }}>
            From <strong>Main Entrance</strong><br />
            To <strong>{room}</strong>
          </div>

          <div className="instructions" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            <ol style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
              {navigationResult.instructions.map((step, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{step}</li>
              ))}
            </ol>
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
            <QRCodePage room={room} />
          </div>
        </>
      )}
    </div>
  )
}