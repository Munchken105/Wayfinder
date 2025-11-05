import "./FloorOne.css";
import firstFloorMap from "../assets/first-floor.png"
export default FloorOne

function FloorOne(){
    const floors = [
        
        {id:5, name:"Floor 5"},
        {id:4, name:"Floor 4"},
        {id:3, name:"Floor 3"},
        {id:2, name:"Floor 2"},
        {id:1, name:"Floor 1"},
        {id:0, name:"Basement"},
    ]

    const key = [
        {id:0, name:"Entrance/Exit"},
        {id:1, name:"Elevators"},
        {id:2, name:"Stairs"},

    ]

    return(
        <div className="floor1">
            <div className="leftside-stuff">
            <div className="floors-sidebar">
                <div className="floor1-title">Floors</div>
                {floors.map((floor) => (
                    <button key={floor.id} className="floor-buttons" id={"floor"+floor.id}>{floor.name}</button>
                ))}
            </div>
            <div className="key">
                <div>Key</div>

            </div>
            </div>

            <div className="floor1-map">
                <img src={firstFloorMap} alt="Map Not Loading" id="floor1Map"/>
            </div>

        </div>

    )
}