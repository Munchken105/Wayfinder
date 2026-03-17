// import QRCodePage from "./QRCodePage";
import "../components/MobilePage.css"
import { useMemo, useState, useEffect } from "react";
import { useNavigation } from "../hooks/navigation"
import { useSearchParams } from "react-router-dom";
import { FaWheelchair } from "react-icons/fa";
import { floorFromRoom } from "../utils/floorFromRoom";


export default function MobilePage() {
  const [mobileStep, setMobileStep] = useState(0);
  const [searchParams] = useSearchParams();
  const [useElevator, setUseElevator] = useState(false);

  const room = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  const {
    navigationResult,
    findPath,
  } = useNavigation();

  useEffect(() => {
    setMobileStep(0);
  }, [room]);

  useEffect(() => { //calls useNavigation
    if (!room) return;
    findPath("Main Entrance", room, useElevator);
    setMobileStep(0);
  }, [room, useElevator, findPath]);

  return (
    <div className="mobile-page">

      <div className="title">
        Navigating from {navigationResult?.start} to {navigationResult?.end}
      </div>

      {room && floorFromRoom(room) !== "Floor 2" && (
        <div className="toggle-boxes mobile-toggle-boxes">
          <button
            className={`sidebar-box ${!useElevator ? "active" : ""}`}
            aria-pressed={!useElevator}
            onClick={() => setUseElevator(false)}
          >
            Stairs
          </button>
          <button
            className={`sidebar-box ${useElevator ? "active" : ""}`}
            aria-pressed={useElevator}
            onClick={() => setUseElevator(true)}
          >
            <FaWheelchair className="icon" />
            Elevator
          </button>
        </div>
      )}

      <div className="buttons-and-inst">

        <div className="instruction-buttons">
          <ul>
            {navigationResult?.instructions.map((_, index) => (
              <li key={index}>
                <button
                  className="steps-mobile"
                  aria-pressed={mobileStep === index}
                  onClick={() => setMobileStep(index)}
                >
                  Step {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="current-instruction">
          <div>Step {mobileStep + 1}</div>
          <div>{navigationResult?.instructions?.[mobileStep]}</div>
        </div>

      </div>
    </div>
  )
}
