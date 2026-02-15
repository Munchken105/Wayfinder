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

export default function WayfindPage(){
    return(
        <div>
            boo
        </div>
    )
}