import QRCodePage from "./QRCodePage";
import { useState, useRef, useEffect } from "react";
import { useNavigation } from "../hooks/navigation"

interface NavigationResult {
  start: string;
  end: string;
  totalSteps: number;
  floor: string;
  path: PathNode[];
  instructions: string[];
}

interface PathNode {
  id: string;
  name: string;
  type: 'room' | 'hallway' | 'junction' | 'entrance';
  floor: number;
}

export default function WayfindPage({ room }: { room: string }){
  const {
    navigationResult,
    loading,
    error,
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
              <li key={index}>{index}. {step} </li>
            ))}
          </ul>
        </div>
        { <QRCodePage 
              room = {room}
              /> }
    </div>
    )
}