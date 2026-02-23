import "./FloorsPage.css";
import { useState, useEffect, act } from "react";
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
  const [backendRooms, setBackendRooms] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<any[]>([]); // Store nodes in the current navigation path


  type Room = {
  id: string
  name: string
  description: string
  top: number
  left: number
  width: number
  height: number
  clipPath?: string
}

  // Fetch backend nodes with coordinates (all location types)
  useEffect(() => {
    fetch("http://localhost:5000/api/nodes")
      .then(res => res.json())
      .then(data => {
        if (data.nodes) {
          // Include all location types: rooms, entrances, bathrooms, elevators, stairs, computer areas, study areas
          setBackendRooms(data.nodes.filter((n: any) => 
            n.type === 'room' || 
            n.type === 'entrance' || 
            n.type === 'computer_area' ||
            n.type === 'study_area' ||
            n.type === 'bathroom' ||
            n.type === 'elevator' ||
            n.type === 'stairs'
          ));
        }
      })
      .catch(err => console.error('Failed to fetch nodes:', err));
  }, []);

  // Fetch the path when a room is selected for wayfinding
  const handleWayfind = (roomName: string) => {
    fetch(`http://localhost:5000/api/navigation/from/main%20entrance/to/${encodeURIComponent(roomName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.path) {
          setCurrentPath(data.path);
          setWayfindClicked(true);
        }
      })
      .catch(err => console.error('Failed to fetch path:', err));
  };

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

  const floorNumToString = (floorNumber: number): keyof typeof floors => {
    if (floorNumber == 0) return "Basement";
    if (floorNumber == 1) return "Floor 1";
    if (floorNumber == 2) return "Floor 2";
    if (floorNumber == 3) return "Floor 3";
    if (floorNumber == 4) return "Floor 4";
    if (floorNumber == 5) return "Floor 5";
    return "Floor 2";
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

  const basementRooms: Room[] = [
    { id: "B48", name: "B48", description: "", top: 488, left: 120, width: 136, height: 84, clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 15%, 90% 0%)" },
    { id: "B41", name: "B41", description: "", top: 573, left: 255, width: 62, height: 64 },
    { id: "B40", name: "B40", description: "", top: 573, left: 367, width: 74, height: 122, clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 10%, 80% 0%)" },
    { id: "B30", name: "B30", description: "", top: 3, left: 643, width: 74, height: 72 },
  ];

  const firstFloorRooms: Room[] = [
    { id: "116", name: "Room 116", description: "Ally Wood", top: 177, left: 184, width: 68, height: 88, clipPath: "polygon(0% 85%, 20% 100%, 100% 100%, 100% 0%)" },
    { id: "117", name: "Room 117", description: "Jill Hackenberg", top: 177, left: 254, width: 46, height: 88 },
    { id: "118", name: "Room 118", description: "Sam Kim", top: 177, left: 300, width: 60, height: 88 },
    { id: "119", name: "Room 119", description: "Erin Rowley", top: 177, left: 360, width: 92, height: 88 },
    { id: "108A", name: "Room 108A", description: "Anna Mayersohn", top: 337, left: 886, width: 80, height: 57 },
    { id: "109", name: "Room 109", description: "", top: 395, left: 819, width: 144, height: 122 },
    { id: "110", name: "Room 110", description: "", top: 518, left: 819, width: 144, height: 88, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 75%)" },
    { id: "105-1", name: "Room 105", description: "Fred Stoss", top: 112, left: 822, width: 142, height: 190, clipPath: "polygon(0% 38%, 0% 89%, 15% 100%, 47% 100%, 47% 38%, 100% 38%, 50% 0%)" },
  ];

  const secondFloorRooms: Room[] = [
    { id: "221", name: "Room 221", description: "", top: 6, left: 390, width: 110, height: 78 },
    { id: "221-D", name: "Room 221-D", description: "", top: 6, left: 506, width: 52, height: 78 },
    { id: "222", name: "Room 222", description: "", top: 6, left: 560, width: 62, height: 78 },
    { id: "222-A", name: "Room 222-A", description: "", top: 7, left: 624, width: 69, height: 78, clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 70% 80%, 70% 0%)" },
    { id: "223", name: "Room 223", description: "", top: 6, left: 674, width: 72, height: 80, clipPath: "polygon(0% 0%, 0% 80%, 30% 100%, 80% 100%, 100% 80%, 100% 0%)" },
    { id: "230", name: "Room 230", description: "", top: 6, left: 909, width: 30, height: 35 },
    { id: "229", name: "Room 229", description: "", top: 43, left: 909, width: 30, height: 40 },
    { id: "228", name: "Room 228", description: "", top: 6, left: 942, width: 62, height: 79 },
    { id: "232", name: "Room 232", description: "", top: 6, left: 1006, width: 28, height: 79 },
  ];

  const thirdFloorRooms: Room[] = [
    // Rooms 324–320
    { id: "324", name: "Room 324", description: "", top: 595, left: 616, width: 36, height: 62 },
    { id: "323", name: "Room 323", description: "", top: 595, left: 652, width: 36, height: 62 },
    { id: "322", name: "Room 322", description: "Natalia Estrada", top: 595, left: 688, width: 28, height: 62 },
    { id: "321", name: "Room 321", description: "", top: 595, left: 717, width: 45, height: 62 },
    { id: "320", name: "Room 320", description: "", top: 595, left: 826, width: 100, height: 62, clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 24% 0%, 0% 25%)"  },

    // Room 319
    { id: "319-1", name: "Room 319", description: "", top: 401, left: 684, width: 54, height: 54, clipPath: "polygon(7% 7%, 9% 0%, 100% 0%, 100% 100%)" },

    // Room 325
    { id: "325-1", name: "Room 325", description: "", top: 478, left: 610, width: 54, height: 52, clipPath: "polygon(0% 100%, 0% 25%, 22% 4%, 100% 87%, 100% 100%)" },

    // Room 326
    { id: "326-1", name: "Room 326", description: "", top: 421, left: 665, width: 71, height: 110, clipPath: "polygon(100% 100%, 0% 100%, 0% 90%, 73% 44%, 27% 17%, 50% 0%, 100% 34% )" },
  ];

  const fourthFloorRooms: Room[] = [
    // Rooms 424-420
    { id: "424", name: "Room 424", description: "Michael Kicey", top: 483, left: 501, width: 26, height: 52, },
    { id: "423", name: "Room 423", description: "Molly Poremski", top: 483, left: 526, width: 26, height: 52 },
    { id: "422", name: "Room 422", description: "Carolyn Klotzbach-Russell", top: 483, left: 551, width: 24, height: 52 },
    { id: "421", name: "Room 421", description: "Laura Taddeo", top: 483, left: 576, width: 24, height: 52 },
    { id: "420C", name: "Room 420C", description: "", top: 483, left: 601, width: 24, height: 52 },
    { id: "420B", name: "Room 420B", description: "", top: 483, left: 626, width: 24, height: 52 },
    { id: "420A", name: "Room 420A", description: "", top: 483, left: 651, width: 24, height: 52 },
    { id: "420", name: "Room 420", description: "", top: 483, left: 684, width: 70, height: 52, clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 24% 0%, 0% 25%)" },

    // Room 419
    { id: "419-1", name: "Room 419", description: "", top: 326, left: 559, width: 42, height: 80, clipPath: "polygon(100% 3%, 100% 57%, 1% 3%)" },

    // Room 425
    { id: "425-1", name: "Room 425", description: "", top: 388, left: 498, width: 42, height: 45, clipPath: "polygon(0% 100%, 0% 25%, 22% 4%, 100% 87%, 100% 100%)" },


    // Room 426
    { id: "426-1", name: "Room 426", description: "", top: 344, left: 541, width: 59, height: 90, clipPath: "polygon(100% 100%, 0% 100%, 0% 90%, 73% 44%, 27% 17%, 50% 0%, 100% 34% )"  },
  ];

  const fifthFloorRooms: Room[] = [
    // Rooms 524-520
    { id: "524", name: "Room 524", description: "", top: 533, left: 553, width: 28, height: 60 },
    { id: "523", name: "Room 523", description: "Bryan Sajecki", top: 533, left: 581, width: 28, height: 60 },
    { id: "522", name: "Room 522", description: "", top: 533, left: 609, width: 28, height: 60 },
    { id: "521", name: "Room 521", description: "", top: 533, left: 637, width: 26, height: 60 },
    { id: "520C", name: "Room 520C", description: "Mary Kamela", top: 533, left: 663, width: 26, height: 60 },
    { id: "520B", name: "Room 520B", description: "", top: 533, left: 689, width: 26, height: 60 },
    { id: "520A", name: "Room 520A", description: "", top: 533, left: 715, width: 30, height: 60 },
    { id: "520", name: "Room 520", description: "", top: 533, left: 754, width: 75, height: 60, clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 24% 0%, 0% 25%)" },
    { id: "517", name: "Room 517", description: "Deborah Chiarella", top: 3, left: 730, width: 100, height: 52 },

    // Room 525
    { id: "525-1", name: "Room 525", description: "", top: 426, left: 545, width: 50, height: 50, clipPath: "polygon(0% 100%, 0% 25%, 22% 4%, 100% 87%, 100% 100%)" },

    // Room 519
    { id: "519-1", name: "Room 519", description: "", top: 363, left: 612, width: 50, height: 50, clipPath: "polygon(7% 7%, 9% 0%, 100% 0%, 100% 100%)" },

    // Room 526
    { id: "526-1", name: "Room 526", description: "", top: 378, left: 595, width: 65, height: 100, clipPath: "polygon(100% 100%, 0% 100%, 0% 90%, 73% 44%, 27% 17%, 50% 0%, 100% 34% )" },
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
            onClick={() => {setActiveFloor("Floor 5")}}
          >Floor 5</button>
          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 4" ? "active" : ""}`}
            onClick={() => {setActiveFloor("Floor 4")}}
          >Floor 4</button>

          <button 
            className={`sidebar-box ${activeFloor === "Floor 3" ? "active" : ""}`}
            onClick={() => {setActiveFloor("Floor 3")}}
          >Floor 3</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 2" ? "active" : ""}`}
            onClick={() => {setActiveFloor("Floor 2")}}
          >Floor 2</button>

          
          <button 
            className={`sidebar-box ${activeFloor === "Floor 1" ? "active" : ""}`}
            onClick={() => {setActiveFloor("Floor 1")}}
          >Floor 1</button>

          <button 
            className={`sidebar-box ${activeFloor === "Basement" ? "active" : ""}`}
            onClick={() => {setActiveFloor("Basement")}}
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
              <button className="close-btn" onClick={() => {setSelectedRoom(null); setWayfindClicked(false); setCurrentPath([])}}>Close</button>
              <h3 className="room-name">{selectedRoom.name}</h3>
              <p className="room-description">{selectedRoom.description}</p>

              {!wayfindClicked && <button className="wayfind-button" onClick={() => handleWayfind(selectedRoom.name)}>Wayfind</button>}

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
            clipPath: room.clipPath ? room.clipPath : undefined,
          }}
          onClick={() => {setSelectedRoom(room); setWayfindClicked(false)}}/>
      ))}
        
        {/* SVG lines connecting path nodes */}
        {wayfindClicked && currentPath.length > 0 && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            {/* Draw lines between consecutive nodes in the path */}
            {currentPath.map((node, i) => {
              if (i === currentPath.length - 1) return null; // Skip last node
              const nextNode = currentPath[i + 1];
              const coord1 = backendRooms.find(r => r.id === node.id)?.coord;
              const coord2 = backendRooms.find(r => r.id === nextNode.id)?.coord;
              if (!coord1 || !coord2) return null;
              if (floorNumToString(coord1) !== activeFloor || floorNumToString(coord2) !== activeFloor) return null;
              return (
                <line
                  key={`line-${i}`}
                  x1={coord1[0]}
                  y1={coord1[1]}
                  x2={coord2[0]}
                  y2={coord2[1]}
                  stroke="red"
                  strokeWidth="3"
                />
              );
            })}
          </svg>
        )}

        {/* Render red dots only for nodes in the current path */}
        {wayfindClicked && currentPath.length > 0 && currentPath.map(node => {
          const location = backendRooms.find(r => r.id === node.id);
          if (!location || !location.coord) return null;
          if (floorNumToString(location.floor) !== activeFloor) return null;
          return (
            <div
              key={`dot-${node.id}`}
              style={{
                position: "absolute",
                left: `${location.coord[0]}px`,
                top: `${location.coord[1]}px`,
                width: "10px",
                height: "10px",
                backgroundColor: "red",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
              title={location.name}
            />
          );
        })}
          
        </div>
      </div>
    </div>
  );
}
    
export default LibraryFloorMap;