// import QRCodePage from "./QRCodePage";
import "../components/MobilePage.css"
import { useState, useEffect } from "react";
import { useNavigation } from "../hooks/navigation"
import { useSearchParams } from "react-router-dom";


export default function MobilePage() {
  const [mobileStep, setMobileStep] = useState(0);
  const [searchParams] = useSearchParams();


  const {
    navigationResult,
    findPath,
  } = useNavigation();

  useEffect(() => { //calls useNavigation
    const room = searchParams.get("q") ?? "";
    console.log(room)
    if (!room) return
    findPath("Main Entrance", room);
  }, []);

  return (
    <div className="mobile-page">

      <div className="title">
        Navigating from {navigationResult?.start} to {navigationResult?.end}
      </div>

      <div className="buttons-and-inst">

        <div className="instruction-buttons">
          <ul>
            {navigationResult?.instructions.map((_, index) => (
              <li key={index}>
                <button className="steps-mobile" onClick={() => setMobileStep(index)}>
                  Step {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="current-instruction">
          <div>Step {mobileStep + 1}</div>
          <div>{navigationResult?.instructions[mobileStep]}</div>
        </div>

      </div>
    </div>
  )
}
