import "./FloorsPage.css";
import { useState } from "react";
import SearchBar from "./SearchBar";
import WayfindPage from "./WayfindPage";

import BasementImg from "../assets/Basementlayout.jpg";
import floor1Img from "../assets/Floor1layout.jpg";
import floor2Img from "../assets/Floor2layout.jpg";
import floor3Img from "../assets/Floor3layout.jpg";
import floor4Img from "../assets/Floor4layout.jpg";
import floor5Img from "../assets/Floor5layout.jpg";

function LibraryFloorMap({ onBack } : { onBack: () => void }) {

  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null); // this is for knowing where to set up boxes
  const [selectedRoom, setSelectedRoom] = useState<{ name: string; description: string;} | null>(null); // this is for making the clicking of the rooms useful
  const [wayfindClicked, setWayfindClicked] = useState(false)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => 
    {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    console.log(`Clicked at: ${x}, ${y}`);
    setLastClick({ x, y });
    };

  //------------------------------------------Initializing the Map-----------------------------------------------------
  const [activeFloor, setActiveFloor] = useState<string | null> (null);
  const ChosenMapImage = () => {
    if (activeFloor == "Basement") return <img src={BasementImg} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 1") return <img src={floor1Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 2") return <img src={floor2Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 3") return <img src={floor3Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 4") return <img src={floor4Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 5") return <img src={floor5Img} className="libary-image" onClick={handleImageClick}/>;

    return <div className="Selection">Select a Floor</div>
  };


  return (
    <div className="floor2-container">
      <div className="searchbar-container">
        <SearchBar placeholder="Type to search" />
                {selectedRoom && (
            <div className="info-panel show">
              <button className="close-btn" onClick={() => {setSelectedRoom(null); setWayfindClicked(false)}}>Close</button>
              <h3>{selectedRoom.name}</h3>
              <p>{selectedRoom.description}</p>

              {!wayfindClicked && <button onClick={() => setWayfindClicked(true)}>Wayfind</button>}

              {
                wayfindClicked && 
                <WayfindPage 
                room = {selectedRoom.name}
                />
              }

            </div>
          )}

      </div>
      <div className="sidebar">
         <h2 className="sidebar-heading">Library Floors</h2>

        <div className="sidebar-boxes">
          <button 
            className={`sidebar-box ${activeFloor === "Floor 5" ? "active" : ""}`}
            onClick={() => setActiveFloor("Floor 5")}
          >Floor 5</button>
          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 4" ? "active" : ""}`}
            onClick={() => setActiveFloor("Floor 4")}
          >Floor 4</button>

          <button 
            className={`sidebar-box ${activeFloor === "Floor 3" ? "active" : ""}`}
            onClick={() => setActiveFloor("Floor 3")}
          >Floor 3</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 2" ? "active" : ""}`}
            onClick={() => setActiveFloor("Floor 2")}
          >Floor 2</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 1" ? "active" : ""}`}
            onClick={() => setActiveFloor("Floor 1")}
          >Floor 1</button>

          <button 
            className={`sidebar-box ${activeFloor === "Basement" ? "active" : ""}`}
            onClick={() => setActiveFloor("Basement")}
          >Basement</button>


          <button className="back-button" onClick={onBack}>Back to Home</button>
        </div>
      </div>
      
      <div className="Map-Content">
        <h1>{activeFloor ? `${activeFloor} Map` : "Library Directory"}</h1>
        <div className="map_wrapper">
        {ChosenMapImage()}

        {/*-----------------------------------------USE TO FIND COORDINATE-------------------------------------------*/}

          {lastClick && (
            <div
            className="hotspot-marker"
            style={{top: `${lastClick.y}px`, left: `${lastClick.x}px`}}>  
            </div>)
          }
        {/*----------------------------------------------------------------------------------------------------------*/} 

        {activeFloor === "Floor 2" && (
            <>
              <div
                className="hotspot"
                style={{ top: "6px", left: "390px", width: "110px", height: "78px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 221", description: "Banana 1" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "506px", width: "52px", height: "78px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 221-D", description: "Banana 2" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "560px", width: "62px", height: "78px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 222", description: "Banana 3" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "624px", width: "46px", height: "78px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 222-A", description: "Banana 4" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "674px", width: "72px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 223", description: "Banana 5" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "909px", width: "30px", height: "35px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 230", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "43px", left: "909px", width: "30px", height: "40px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 229", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "942px", width: "62px", height: "79px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 228", description: "Banana 8" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "1006px", width: "28px", height: "79px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 232", description: "Banana 9" })}
              ></div>
            </>
          )}
          
        </div>
      </div>
          {/* -----------------------------------------Shows the information page on the left-------------------------------------------
          {selectedRoom && (
            <div className="info-panel show">
              <button className="close-btn" onClick={() => setSelectedRoom(null)}>Close</button>
              <h3>{selectedRoom.name}</h3>
              <p>{selectedRoom.description}</p>
            </div>
          )} */}
    </div>
  );
}
    
export default LibraryFloorMap;