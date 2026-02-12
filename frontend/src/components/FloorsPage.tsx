import "./FloorsPage.css";
import { useState } from "react";
import SearchBar from "./SearchBar";

import BasementImg from "../assets/Basementlayout.jpg";
import floor1Img from "../assets/Floor1layout.jpg";
import floor2Img from "../assets/Floor2layout.jpg";
import floor3Img from "../assets/Floor3layout.jpg";
import floor4Img from "../assets/Floor4layout.jpg";
import floor5Img from "../assets/Floor5layout.jpg";

function LibraryFloorMap({ onBack }: {onBack: () => void}) {

  const [lastClick, setLastClick] = useState<{ x: number; y: number } | null>(null); // this is for knowing where to set up boxes
  const [selectedRoom, setSelectedRoom] = useState<{ name: string; description: string;} | null>(null); // this is for making the clicking of the rooms useful
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => 
    {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    console.log(`Clicked at: ${x}, ${y}`);
    setLastClick({ x, y });
    };

  //------------------------------------------Initializing the Map-----------------------------------------------------
  const [activeFloor, setActiveFloor] = useState<string | null> ("Floor 2");
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
        

        {activeFloor === "Basement" && (
            <>
              <div
                className="hotspot"
                style={{ top: "488px", left: "120px", width: "136px", height: "84px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "B48", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "573px", left: "255px", width: "62px", height: "64px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "B41", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "573px", left: "367px", width: "74px", height: "122px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "B40", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "3px", left: "643px", width: "74px", height: "72px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "B30", description: "Banana 0" })}
              ></div>
            </>
          )}

        {activeFloor === "Floor 1" && (
            <>
              <div
                className="hotspot"
                style={{ top: "177px", left: "184px", width: "68px", height: "88px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 116", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "177px", left: "254px", width: "46px", height: "88px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 117", description: "Banana 1" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "177px", left: "300px", width: "60px", height: "88px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 118", description: "Banana 2" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "177px", left: "360px", width: "92px", height: "88px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 119", description: "Banana 3" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "337px", left: "886px", width: "80px", height: "57px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 108", description: "Banana 4" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "395px", left: "819px", width: "144px", height: "122px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 109", description: "Banana 5" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "518px", left: "819px", width: "144px", height: "88px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 110", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "112px", left: "819px", width: "144px", height: "74px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 105A", description: "Banana 7A" })}
              ></div>

               <div
                className="hotspot"
                style={{ top: "187px", left: "819px", width: "70px", height: "116px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 105B", description: "Banana 7B" })}
              ></div>


            </>
          )}

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
                style={{ top: "6px", left: "624px", width: "48px", height: "78px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 222-A", description: "Banana 4" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "6px", left: "674px", width: "72px", height: "80px", position: "absolute" }}
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

          {activeFloor === "Floor 3" && (
            <>
              <div
                className="hotspot"
                style={{ top: "595px", left: "616px", width: "36px", height: "62px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 324", description: "Banana 1" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "595px", left: "652px", width: "36px", height: "62px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 323", description: "Banana 2" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "595px", left: "688px", width: "28px", height: "62px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 322", description: "Banana 3" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "595px", left: "717px", width: "45px", height: "62px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 321", description: "Banana 4" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "595px", left: "826px", width: "100px", height: "62px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 320", description: "Banana 5" })}
              ></div>

{/*-------------------------------------------------------Room 319-------------------------------------------------*/} 
              <div
                className="hotspot"
                style={{ top: "401px", left: "689px", width: "48px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 319", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "411px", left: "700px", width: "37px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 319", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "421px", left: "708px", width: "28px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 319", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "431px", left: "718px", width: "18px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 319", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "441px", left: "726px", width: "10px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 319", description: "Banana 6" })}
              ></div>
{/*----------------------------------------------------------------------------------------------------------*/}

{/*-------------------------------------------------Room 325-------------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "481px", left: "609px", width: "18px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 325", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "491px", left: "609px", width: "28px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 325", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "501px", left: "609px", width: "42px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 325", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "511px", left: "609px", width: "50px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 325", description: "Banana 6" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "521px", left: "609px", width: "56px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 325", description: "Banana 6" })}
              ></div>
{/*----------------------------------------------------------------------------------------------------------*/}

{/*------------------------------------------------Room 326----------------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "421px", left: "694px", width: "14px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "431px", left: "688px", width: "28px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "441px", left: "694px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "451px", left: "704px", width: "32px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "461px", left: "712px", width: "24px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "471px", left: "708px", width: "28px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "481px", left: "698px", width: "38px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "491px", left: "690px", width: "46px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "501px", left: "680px", width: "56px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "511px", left: "672px", width: "64px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>
              <div
                className="hotspot"
                style={{ top: "521px", left: "665px", width: "71px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 326", description: "Banana 7" })}
              ></div>
            </>
          )}

          {activeFloor === "Floor 4" && (
            <>
              <div
                className="hotspot"
                style={{ top: "483px", left: "501px", width: "26px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 424", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "526px", width: "26px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 423", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "551px", width: "24px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 422", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "576px", width: "24px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 421", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "601px", width: "24px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 420C", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "626px", width: "24px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 420B", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "651px", width: "24px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 420A", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "483px", left: "684px", width: "70px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 420", description: "Banana 0" })}
              ></div>

{/*------------------------------------------------Room 419----------------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "326px", left: "562px", width: "38px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "336px", left: "567px", width: "33px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "346px", left: "578px", width: "22px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "356px", left: "586px", width: "14px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

{/*-----------------------------------------------Room 419------------------------------------------------------------*/}

              <div
                className="hotspot"
                style={{ top: "390px", left: "497px", width: "14px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "400px", left: "497px", width: "22px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "410px", left: "497px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "420px", left: "497px", width: "40px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 419", description: "Banana 0" })}
              ></div>
{/*------------------------------------------------------------------------------------------------------------*/}

{/*-----------------------------------------------Room 426----------------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "346px", left: "560px", width: "22px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "356px", left: "560px", width: "26px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "366px", left: "570px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "376px", left: "580px", width: "20px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "386px", left: "575px", width: "25px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "396px", left: "565px", width: "35px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "406px", left: "550px", width: "50px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "416px", left: "540px", width: "60px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>
              <div
                className="hotspot"
                style={{ top: "426px", left: "540px", width: "60px", height: "5px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 426", description: "Banana 0" })}
              ></div>
{/*------------------------------------------------------------------------------------------------------------*/}
            </>
          )}

          {activeFloor === "Floor 5" && (
            <>
              <div
                className="hotspot"
                style={{ top: "533px", left: "553px", width: "28px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 524", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "581px", width: "28px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 523", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "609px", width: "28px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 522", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "637px", width: "26px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 521", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "663px", width: "26px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 520C", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "689px", width: "26px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 520B", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "715px", width: "30px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 520A", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "533px", left: "754px", width: "75px", height: "60px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 520", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "3px", left: "730px", width: "100px", height: "52px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 517", description: "Banana 0" })}
              ></div>
{/*---------------------------------------------------------Room 525_------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "426px", left: "545px", width: "15px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 525", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "436px", left: "545px", width: "25px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 525", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "446px", left: "545px", width: "35px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 525", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "456px", left: "545px", width: "42px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 525", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "466px", left: "545px", width: "50px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 525", description: "Banana 0" })}
              ></div>
{/*---------------------------------------------------------------------------------------------------------*/}

{/*---------------------------------------------------------Room 519------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "358px", left: "612px", width: "50px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 519", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "368px", left: "622px", width: "40px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 519", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "378px", left: "632px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 519", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "388px", left: "642px", width: "20px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 519", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "398px", left: "652px", width: "10px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 519", description: "Banana 0" })}
              ></div>
{/*-------------------------------------------------------------------------------------------------------------*/}


{/*----------------------------------------------------Room 526-------------------------------------------------------*/}
              <div
                className="hotspot"
                style={{ top: "378px", left: "620px", width: "12px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "388px", left: "610px", width: "34px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "398px", left: "620px", width: "34px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "408px", left: "630px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "418px", left: "640px", width: "20px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "428px", left: "630px", width: "30px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "438px", left: "620px", width: "40px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "448px", left: "610px", width: "50px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "458px", left: "600px", width: "60px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>

              <div
                className="hotspot"
                style={{ top: "468px", left: "595px", width: "65px", height: "10px", position: "absolute" }}
                onClick={() => setSelectedRoom({ name: "Room 526", description: "Banana 0" })}
              ></div>
{/*-------------------------------------------------------------------------------------------------------------*/}


            </>
          )}
          
        </div>
      </div>
          {/*-----------------------------------------Shows the information page on the left-------------------------------------------*/}
          {selectedRoom && (
            <div className="info-panel show">
              <button className="close-btn" onClick={() => setSelectedRoom(null)}>Close</button>
              <h3>{selectedRoom.name}</h3>
              <p>{selectedRoom.description}</p>
            </div>
          )}
    </div>
  );
}
    
export default LibraryFloorMap;
