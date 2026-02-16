import QRCodePage from "./QRCodePage";
import { useEffect } from "react";
import { useNavigation } from "../hooks/navigation"

export default function WayfindPage({ room }: { room: string }){
  const {
    navigationResult,
    findPath,
  } = useNavigation();
    
  useEffect(() => { //calls useNavigation
    findPath("Main Entrance", room);
  }, [room]);

    return (
    <div>
        <h1>Navigating from Main Entrance to {room}</h1>
        <div className="from-and-to"> {navigationResult?.start} To {navigationResult?.end}</div>
        <div className="path"></div>
        <div className="instructions">

          <ul>
            {navigationResult?.instructions.map((step, index) => (
              <li key={index}>{index + 1}. {step} </li>
            ))}
          </ul>
        </div>
        { <QRCodePage 
              room = {room}
              /> }
    </div>
    )
}