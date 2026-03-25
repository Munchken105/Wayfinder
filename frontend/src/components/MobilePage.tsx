// import QRCodePage from "./QRCodePage";
import "../components/MobilePage.css"
import { useMemo, useState, useEffect } from "react";
import { useNavigation } from "../hooks/navigation"
import { useSearchParams } from "react-router-dom";
import { FaWheelchair } from "react-icons/fa";
import { floorFromRoom } from "../utils/floorFromRoom";
import BasementImg from "../assets/Basementlayout.jpg";
import floor1Img from "../assets/Floor1layout.jpg";
import floor2Img from "../assets/Floor2layout.jpg";
import floor3Img from "../assets/Floor3layout.jpg";
import floor4Img from "../assets/Floor4layout.jpg";
import floor5Img from "../assets/Floor5layout.jpg";

type FloorName = "Basement" | "Floor 1" | "Floor 2" | "Floor 3" | "Floor 4" | "Floor 5";
type BackendNode = {
  id: string;
  floor: number;
  coord?: [number, number];
  name?: string;
};

export default function MobilePage() {
  const [mobileStep, setMobileStep] = useState(0);
  const [searchParams] = useSearchParams();
  const [useElevator, setUseElevator] = useState(false);
  const [backendNodes, setBackendNodes] = useState<BackendNode[]>([]);
  const [activeFloor, setActiveFloor] = useState<FloorName>("Floor 2");

  const room = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  const {
    navigationResult,
    findPath,
  } = useNavigation();

  const floorNumToString = (floorNumber: number): FloorName => {
    if (floorNumber === 0) return "Basement";
    if (floorNumber === 1) return "Floor 1";
    if (floorNumber === 2) return "Floor 2";
    if (floorNumber === 3) return "Floor 3";
    if (floorNumber === 4) return "Floor 4";
    return "Floor 5";
  };

  const floorImage: Record<FloorName, string> = {
    "Basement": BasementImg,
    "Floor 1": floor1Img,
    "Floor 2": floor2Img,
    "Floor 3": floor3Img,
    "Floor 4": floor4Img,
    "Floor 5": floor5Img,
  };

  const pathFloors = useMemo(() => {
    if (!navigationResult?.path?.length || backendNodes.length === 0) {
      return ["Floor 2"] as FloorName[];
    }

    const floors = new Set<FloorName>();
    navigationResult.path.forEach((node) => {
      const match = backendNodes.find((n) => n.id === node.id);
      if (match) floors.add(floorNumToString(match.floor));
    });

    return floors.size > 0 ? Array.from(floors) : (["Floor 2"] as FloorName[]);
  }, [navigationResult, backendNodes]);

  useEffect(() => {
    fetch("/api/nodes", { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes) setBackendNodes(data.nodes);
      })
      .catch(() => setBackendNodes([]));
  }, []);

  useEffect(() => {
    setMobileStep(0);
  }, [room]);

  useEffect(() => { //calls useNavigation
    if (!room) return;
    findPath("Main Entrance", room, useElevator);
    setMobileStep(0);
  }, [room, useElevator, findPath]);

  useEffect(() => {
    if (pathFloors.length > 0) {
      setActiveFloor(pathFloors[0]);
    }
  }, [pathFloors]);

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

      {navigationResult?.path?.length ? (
        <div className="mobile-map-section">
          <div className="mobile-floor-buttons">
            {pathFloors.map((floor) => (
              <button
                key={floor}
                className={`sidebar-box ${activeFloor === floor ? "active" : ""}`}
                onClick={() => setActiveFloor(floor)}
              >
                {floor}
              </button>
            ))}
          </div>

          <div className="mobile-map-wrapper">
            <img src={floorImage[activeFloor]} className="mobile-library-image" />

            <svg
              className="mobile-path-svg"
              viewBox="0 0 1063 706"
              preserveAspectRatio="xMidYMid meet"
            >
              {navigationResult.path.map((node, i) => {
                if (i === navigationResult.path.length - 1) return null;
                const nextNode = navigationResult.path[i + 1];
                const point1 = backendNodes.find((n) => n.id === node.id);
                const point2 = backendNodes.find((n) => n.id === nextNode.id);

                if (!point1?.coord || !point2?.coord) return null;
                if (floorNumToString(point1.floor) !== activeFloor || floorNumToString(point2.floor) !== activeFloor) return null;

                return (
                  <line
                    key={`line-${i}`}
                    x1={point1.coord[0]}
                    y1={point1.coord[1]}
                    x2={point2.coord[0]}
                    y2={point2.coord[1]}
                    stroke="red"
                    strokeWidth="4"
                    className="waypoint-line"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {navigationResult.path.map((node) => {
              const location = backendNodes.find((n) => n.id === node.id);
              if (!location?.coord) return null;
              if (floorNumToString(location.floor) !== activeFloor) return null;

              return (
                <div
                  key={`dot-${node.id}`}
                  className="mobile-path-dot"
                  style={{
                    left: `${(location.coord[0] / 1063) * 100}%`,
                    top: `${(location.coord[1] / 706) * 100}%`,
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
