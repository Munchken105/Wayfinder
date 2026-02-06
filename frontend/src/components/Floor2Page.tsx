import "./Floor2Page.css";
import { useState } from "react";
import SearchBar from "./SearchBar";

import libraryImg from "../assets/Floor2layout.jpg";
import QRCodePage from "../components/QRCodePage";
import WayfindPage from "../components/WayfindPage"
const libraryImageUrl = libraryImg;

function Floor2Page({ onBack }: { onBack: () => void }) {

  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null); // this is for knowing where to set up boxes

  const [selectedRoom, setSelectedRoom] = useState<{ name: string; description: string;} | null>(null); // this is for making the clicking of the rooms useful


  const [wayfindClicked, setWayfindClicked] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {

  const x = e.nativeEvent.offsetX;
  const y = e.nativeEvent.offsetY;

  console.log(`Clicked at: ${x}, ${y}`);
  setLastClick({ x, y });

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
          <button className="sidebar-box">Floor 5</button>
          <button className="sidebar-box">Floor 4</button>
          <button className="sidebar-box">Floor 3</button>
          <button className="sidebar-box">Floor 2</button>
          <button className="sidebar-box">Floor 1</button>
          <button className="sidebar-box">Basement</button>
          <button className="back-button" onClick={onBack}>Back to Home</button>
        </div>
      </div>
      
      <div className="Map-Content">
        <h1>Floor 2 Map</h1>
        <div className="map_wrapper">
          {/*------------------------------------------------MAP------------------------------------------------------*/}
          <img
            src={libraryImageUrl}
            alt="Lockwood Library"
            className="library-image"
            onClick={handleImageClick}
          />
          <div
            className="test-marker"
            style={{
              top: "0px",
              left: "0px"
            }}
          ></div>

            <div
              className="hotspot"
              style={{
                top: "6px",
                left: "376px",
                width: "101px",
                height: "71px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 221",
                description: "Banana 1"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "6px",
                left: "485px",
                width: "45px",
                height: "71px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 221-D",
                description: "Banana 2"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "6px",
                left: "537px",
                width: "55px",
                height: "71px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 222",
                description: "Banana 3"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "6px",
                left: "601px",
                width: "39px",
                height: "71px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 222-A",
                description: "Banana 4"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "8px",
                left: "648px",
                width: "65px",
                height: "50px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 223",
                description: "Banana 5"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "7px",
                left: "872px",
                width: "30px",
                height: "32px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 230",
                description: "Banana 6"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "43px",
                left: "872px",
                width: "30px",
                height: "36px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 229",
                description: "Banana 7"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "6px",
                left: "904px",
                width: "57px",
                height: "73px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 228",
                description: "Banana 8"
              })} 
            ></div>

            <div
              className="hotspot"
              style={{
                top: "3px",
                left: "964px",
                width: "28px",
                height: "75px"
              }}
              onClick={() => setSelectedRoom({
                name: "Room 232",
                description: "Banana 9"
              })} 
            ></div>

          {/*-----------------------------------------USE TO FIND COORDINATE-------------------------------------------*/}

          {lastClick && (
            <div
            className="hotspot-marker"
            style={{top: `${lastClick.y}px`, left: `${lastClick.x}px`}}>  
            </div>)
          }


          {/*-----------------------------------------Shows the information page on the left-------------------------------------------*/}
          {/* {selectedRoom && (
            <div className="info-panel show">
              <button className="close-btn" onClick={() => setSelectedRoom(null)}>Close</button>
              <h3>{selectedRoom.name}</h3>
              <p>{selectedRoom.description}</p>
            </div>
          )} */}

        </div>
        
      </div>
    </div>
    
  );
}

export default Floor2Page;