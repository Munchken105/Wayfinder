import "./Floor2Page.css";

import libraryImg from "../assets/Floor2layout.jpg";
const libraryImageUrl = libraryImg;

function Floor2Page({ onBack }: { onBack: () => void }) {
  return (
    <div className="floor2-container">
      {}
      <div className="sidebar">
         <h2 className="sidebar-heading">Library Floors</h2>

        <div className="sidebar-boxes">
          <button className="sidebar-box">Floor 5</button>
          <button className="sidebar-box">Floor 4</button>
          <button className="sidebar-box">Floor 3</button>
          <button className="sidebar-box">Floor 2</button>
          <button className="sidebar-box">Floor 1</button>
          <button className="sidebar-box">Basement</button>
        </div>

      </div>

      <div className="Map-Content">
        <h1>Floor 2 Map</h1>
        <img
            src={libraryImageUrl}
            alt="Lockwood Library"
            className="library-image"
          />
        <button onClick={onBack}>Go Back to Navigate</button>
      </div>
    </div>
  );
}

export default Floor2Page;
