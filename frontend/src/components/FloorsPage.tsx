import "./FloorsPage.css";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import WayfindPage from "./WayfindPage";
import { useNavigate } from "react-router-dom";

import BasementImg from "../assets/Basementlayout.jpg";
import floor1Img from "../assets/Floor1layout.jpg";
import floor2Img from "../assets/Floor2layout.jpg";
import floor3Img from "../assets/Floor3layout.jpg";
import floor4Img from "../assets/Floor4layout.jpg";
import floor5Img from "../assets/Floor5layout.jpg";

function LibraryFloorMap() {

  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null); // this is for knowing where to set up boxes
  const [selectedRoom, setSelectedRoom] = useState<{ name: string; description: string; id: string} | null>(null); // this is for making the clicking of the rooms useful
  const [wayfindClicked, setWayfindClicked] = useState(false)
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => 
    {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    console.log(`Clicked at: ${x}, ${y}`);
    setLastClick({ x, y });
    };

  //------------------------------------------Initializing the Map-----------------------------------------------------

  type FloorKey = keyof typeof floors;
  const [activeFloor, setActiveFloor] = useState<FloorKey>("Floor 2");
  const ChosenMapImage = () => {
    if (activeFloor == "Basement") return <img src={BasementImg} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 1") return <img src={floor1Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 2") return <img src={floor2Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 3") return <img src={floor3Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 4") return <img src={floor4Img} className="libary-image" onClick={handleImageClick}/>;
    if (activeFloor == "Floor 5") return <img src={floor5Img} className="libary-image" onClick={handleImageClick}/>;

    return <div className="Selection">Select a Floor</div>
  };

  const floorFromRoom = (room: string): keyof typeof floors => {
    const num = parseInt(room.replace(/\D/g, ""), 10);

    if (isNaN(num)) return "Floor 2";
    if (num < 100) return "Basement";
    if (num < 200) return "Floor 1";
    if (num < 300) return "Floor 2";
    if (num < 400) return "Floor 3";
    if (num < 500) return "Floor 4";
    return "Floor 5";
  };

  const [pendingRoom, setPendingRoom] = useState<string | null>(null);

  useEffect(() => {
    
    if (activeFloor && pendingRoom) {
      console.log(pendingRoom);
      const roomObj = floors[activeFloor].find(r => r.name === pendingRoom);
      if (roomObj) {
        setSelectedRoom(roomObj);
      }
      setPendingRoom(null); // clear pending
    }
    
  }, [pendingRoom]);

  const navigate = useNavigate();

  const basementRooms = [
    { id: "B48", name: "B48", description: "", top: 488, left: 120, width: 136, height: 84 },
    { id: "B41", name: "B41", description: "", top: 573, left: 255, width: 62, height: 64 },
    { id: "B40", name: "B40", description: "", top: 573, left: 367, width: 74, height: 122 },
    { id: "B30", name: "B30", description: "", top: 3, left: 643, width: 74, height: 72 },
  ];

  const firstFloorRooms = [
    { id: "116", name: "Room 116", description: "Ally Wood", top: 177, left: 184, width: 68, height: 88 },
    { id: "117", name: "Room 117", description: "Jill Hackenberg", top: 177, left: 254, width: 46, height: 88 },
    { id: "118", name: "Room 118", description: "Sam Kim", top: 177, left: 300, width: 60, height: 88 },
    { id: "119", name: "Room 119", description: "Erin Rowley", top: 177, left: 360, width: 92, height: 88 },
    { id: "108A", name: "Room 108A", description: "Anna Mayersohn", top: 337, left: 886, width: 80, height: 57 },
    { id: "109", name: "Room 109", description: "", top: 395, left: 819, width: 144, height: 122 },
    { id: "110", name: "Room 110", description: "", top: 518, left: 819, width: 144, height: 88 },
    { id: "105-1", name: "Room 105", description: "Fred Stoss", top: 187, left: 819, width: 70, height: 116 },
    { id: "105-2", name: "Room 105", description: "Fred Stoss", top: 112, left: 819, width: 144, height: 74 },
  ];

  const secondFloorRooms = [
    { id: "221", name: "Room 221", description: "", top: 6, left: 390, width: 110, height: 78 },
    { id: "221-D", name: "Room 221-D", description: "", top: 6, left: 506, width: 52, height: 78 },
    { id: "222", name: "Room 222", description: "", top: 6, left: 560, width: 62, height: 78 },
    { id: "222-A", name: "Room 222-A", description: "", top: 6, left: 624, width: 48, height: 78 },
    { id: "223", name: "Room 223", description: "", top: 6, left: 674, width: 72, height: 80 },
    { id: "230", name: "Room 230", description: "", top: 6, left: 909, width: 30, height: 35 },
    { id: "229", name: "Room 229", description: "", top: 43, left: 909, width: 30, height: 40 },
    { id: "228", name: "Room 228", description: "", top: 6, left: 942, width: 62, height: 79 },
    { id: "232", name: "Room 232", description: "", top: 6, left: 1006, width: 28, height: 79 },
  ];

  const thirdFloorRooms = [
    // Rooms 324–320
    { id: "324", name: "Room 324", description: "", top: 595, left: 616, width: 36, height: 62 },
    { id: "323", name: "Room 323", description: "", top: 595, left: 652, width: 36, height: 62 },
    { id: "322", name: "Room 322", description: "Natalia Estrada", top: 595, left: 688, width: 28, height: 62 },
    { id: "321", name: "Room 321", description: "", top: 595, left: 717, width: 45, height: 62 },
    { id: "320", name: "Room 320", description: "", top: 595, left: 826, width: 100, height: 62 },

    // Room 319
    { id: "319-1", name: "Room 319", description: "", top: 401, left: 689, width: 48, height: 10 },
    { id: "319-2", name: "Room 319", description: "", top: 411, left: 700, width: 37, height: 10 },
    { id: "319-3", name: "Room 319", description: "", top: 421, left: 708, width: 28, height: 10 },
    { id: "319-4", name: "Room 319", description: "", top: 431, left: 718, width: 18, height: 10 },
    { id: "319-5", name: "Room 319", description: "", top: 441, left: 726, width: 10, height: 10 },

    // Room 325
    { id: "325-1", name: "Room 325", description: "", top: 481, left: 609, width: 18, height: 10 },
    { id: "325-2", name: "Room 325", description: "", top: 491, left: 609, width: 28, height: 10 },
    { id: "325-3", name: "Room 325", description: "", top: 501, left: 609, width: 42, height: 10 },
    { id: "325-4", name: "Room 325", description: "", top: 511, left: 609, width: 50, height: 10 },
    { id: "325-5", name: "Room 325", description: "", top: 521, left: 609, width: 56, height: 10 },

    // Room 326
    { id: "326-1", name: "Room 326", description: "", top: 421, left: 694, width: 14, height: 10 },
    { id: "326-2", name: "Room 326", description: "", top: 431, left: 688, width: 28, height: 10 },
    { id: "326-3", name: "Room 326", description: "", top: 441, left: 694, width: 30, height: 10 },
    { id: "326-4", name: "Room 326", description: "", top: 451, left: 704, width: 32, height: 10 },
    { id: "326-5", name: "Room 326", description: "", top: 461, left: 712, width: 24, height: 10 },
    { id: "326-6", name: "Room 326", description: "", top: 471, left: 708, width: 28, height: 10 },
    { id: "326-7", name: "Room 326", description: "", top: 481, left: 698, width: 38, height: 10 },
    { id: "326-8", name: "Room 326", description: "", top: 491, left: 690, width: 46, height: 10 },
    { id: "326-9", name: "Room 326", description: "", top: 501, left: 680, width: 56, height: 10 },
    { id: "326-10", name: "Room 326", description: "", top: 511, left: 672, width: 64, height: 10 },
    { id: "326-11", name: "Room 326", description: "", top: 521, left: 665, width: 71, height: 10 },
  ];

  const fourthFloorRooms = [
    // Rooms 424-420
    { id: "424", name: "Room 424", description: "Michael Kicey", top: 483, left: 501, width: 26, height: 52 },
    { id: "423", name: "Room 423", description: "Molly Poremski", top: 483, left: 526, width: 26, height: 52 },
    { id: "422", name: "Room 422", description: "Carolyn Klotzbach-Russell", top: 483, left: 551, width: 24, height: 52 },
    { id: "421", name: "Room 421", description: "Laura Taddeo", top: 483, left: 576, width: 24, height: 52 },
    { id: "420C", name: "Room 420C", description: "", top: 483, left: 601, width: 24, height: 52 },
    { id: "420B", name: "Room 420B", description: "", top: 483, left: 626, width: 24, height: 52 },
    { id: "420A", name: "Room 420A", description: "", top: 483, left: 651, width: 24, height: 52 },
    { id: "420", name: "Room 420", description: "", top: 483, left: 684, width: 70, height: 52 },

    // Room 419
    { id: "419-1", name: "Room 419", description: "", top: 326, left: 562, width: 38, height: 10 },
    { id: "419-2", name: "Room 419", description: "", top: 336, left: 567, width: 33, height: 10 },
    { id: "419-3", name: "Room 419", description: "", top: 346, left: 578, width: 22, height: 10 },
    { id: "419-4", name: "Room 419", description: "", top: 356, left: 586, width: 14, height: 10 },
    { id: "419-5", name: "Room 419", description: "", top: 390, left: 497, width: 14, height: 10 },
    { id: "419-6", name: "Room 419", description: "", top: 400, left: 497, width: 22, height: 10 },
    { id: "419-7", name: "Room 419", description: "", top: 410, left: 497, width: 30, height: 10 },
    { id: "419-8", name: "Room 419", description: "", top: 420, left: 497, width: 40, height: 10 },

    // Room 426
    { id: "426-1", name: "Room 426", description: "", top: 346, left: 560, width: 22, height: 10 },
    { id: "426-2", name: "Room 426", description: "", top: 356, left: 560, width: 26, height: 10 },
    { id: "426-3", name: "Room 426", description: "", top: 366, left: 570, width: 30, height: 10 },
    { id: "426-4", name: "Room 426", description: "", top: 376, left: 580, width: 20, height: 10 },
    { id: "426-5", name: "Room 426", description: "", top: 386, left: 575, width: 25, height: 10 },
    { id: "426-6", name: "Room 426", description: "", top: 396, left: 565, width: 35, height: 10 },
    { id: "426-7", name: "Room 426", description: "", top: 406, left: 550, width: 50, height: 10 },
    { id: "426-8", name: "Room 426", description: "", top: 416, left: 540, width: 60, height: 10 },
    { id: "426-9", name: "Room 426", description: "", top: 426, left: 540, width: 60, height: 5 },
  ];

  const fifthFloorRooms = [
    // Rooms 524-520
    { id: "524", name: "Room 524", description: "", top: 533, left: 553, width: 28, height: 60 },
    { id: "523", name: "Room 523", description: "Bryan Sajecki", top: 533, left: 581, width: 28, height: 60 },
    { id: "522", name: "Room 522", description: "", top: 533, left: 609, width: 28, height: 60 },
    { id: "521", name: "Room 521", description: "", top: 533, left: 637, width: 26, height: 60 },
    { id: "520C", name: "Room 520C", description: "Mary Kamela", top: 533, left: 663, width: 26, height: 60 },
    { id: "520B", name: "Room 520B", description: "", top: 533, left: 689, width: 26, height: 60 },
    { id: "520A", name: "Room 520A", description: "", top: 533, left: 715, width: 30, height: 60 },
    { id: "520", name: "Room 520", description: "", top: 533, left: 754, width: 75, height: 60 },
    { id: "517", name: "Room 517", description: "Deborah Chiarella", top: 3, left: 730, width: 100, height: 52 },

    // Room 525
    { id: "525-1", name: "Room 525", description: "", top: 426, left: 545, width: 15, height: 10 },
    { id: "525-2", name: "Room 525", description: "", top: 436, left: 545, width: 25, height: 10 },
    { id: "525-3", name: "Room 525", description: "", top: 446, left: 545, width: 35, height: 10 },
    { id: "525-4", name: "Room 525", description: "", top: 456, left: 545, width: 42, height: 10 },
    { id: "525-5", name: "Room 525", description: "", top: 466, left: 545, width: 50, height: 10 },

    // Room 519
    { id: "519-1", name: "Room 519", description: "", top: 358, left: 612, width: 50, height: 10 },
    { id: "519-2", name: "Room 519", description: "", top: 368, left: 622, width: 40, height: 10 },
    { id: "519-3", name: "Room 519", description: "", top: 378, left: 632, width: 30, height: 10 },
    { id: "519-4", name: "Room 519", description: "", top: 388, left: 642, width: 20, height: 10 },
    { id: "519-5", name: "Room 519", description: "", top: 398, left: 652, width: 10, height: 10 },

    // Room 526
    { id: "526-1", name: "Room 526", description: "", top: 378, left: 620, width: 12, height: 10 },
    { id: "526-2", name: "Room 526", description: "", top: 388, left: 610, width: 34, height: 10 },
    { id: "526-3", name: "Room 526", description: "", top: 398, left: 620, width: 34, height: 10 },
    { id: "526-4", name: "Room 526", description: "", top: 408, left: 630, width: 30, height: 10 },
    { id: "526-5", name: "Room 526", description: "", top: 418, left: 640, width: 20, height: 10 },
    { id: "526-6", name: "Room 526", description: "", top: 428, left: 630, width: 30, height: 10 },
    { id: "526-7", name: "Room 526", description: "", top: 438, left: 620, width: 40, height: 10 },
    { id: "526-8", name: "Room 526", description: "", top: 448, left: 610, width: 50, height: 10 },
    { id: "526-9", name: "Room 526", description: "", top: 458, left: 600, width: 60, height: 10 },
    { id: "526-10", name: "Room 526", description: "", top: 468, left: 595, width: 65, height: 10 },
  ];

  const floors = {
    "Basement": basementRooms,
    "Floor 1": firstFloorRooms,
    "Floor 2": secondFloorRooms, 
    "Floor 3": thirdFloorRooms,
    "Floor 4": fourthFloorRooms,
    "Floor 5": fifthFloorRooms
  };

  return (
    <div className="floor-container">
      <div className="sidebar">
         <h2 className="sidebar-heading">Library Floors</h2>

        <div className="sidebar-boxes">
          <button 
            className={`sidebar-box ${activeFloor === "Floor 5" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Floor 5")}}
          >Floor 5</button>
          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 4" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Floor 4")}}
          >Floor 4</button>

          <button 
            className={`sidebar-box ${activeFloor === "Floor 3" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Floor 3")}}
          >Floor 3</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 2" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Floor 2")}}
          >Floor 2</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 1" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Floor 1")}}
          >Floor 1</button>

          <button 
            className={`sidebar-box ${activeFloor === "Basement" ? "active" : ""}`}
            onClick={() => {setSelectedRoom(null); setActiveFloor("Basement")}}
          >Basement</button>

          <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
      
      <div className="Map-Content">
        <div className="searchbar-container">
        <SearchBar
          placeholder="Type to search"
          onSelectResult={room => {
            const floor = floorFromRoom(room) as keyof typeof floors;
            setActiveFloor(floor);
            const roomNumber = room.split(" ")[0];
            setPendingRoom("Room " + roomNumber); // will trigger useEffect
          }}
        />
          {selectedRoom && (
            <div className="info-panel show">
              <button className="close-btn" onClick={() => {setSelectedRoom(null); setWayfindClicked(false)}}>Close</button>
              <h3 className="room-name">{selectedRoom.name}</h3>
              <p className="room-description">{selectedRoom.description}</p>

              {!wayfindClicked && <button className="wayfind-button" onClick={() => setWayfindClicked(true)}>Wayfind</button>}

              {
                wayfindClicked && 
                <WayfindPage 
                room = {selectedRoom.name}
                />
              }

            </div>
          )}

      </div>
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
        
        {activeFloor && floors[activeFloor].map(room => (
        <div
          key={room.id}
          className={`hotspot ${selectedRoom?.id === room.id ? "active" : ""}`}
          style={{
            top: `${room.top}px`,
            left: `${room.left}px`,
            width: `${room.width}px`,
            height: `${room.height}px`,
            position: "absolute",
          }}
          onClick={() => setSelectedRoom(room)}
        />
      ))}
          
        </div>
      </div>
    </div>
  );
}
    
export default LibraryFloorMap;