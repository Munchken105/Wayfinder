import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import libraryImg from "../assets/lockwood-library.jpg";
const libraryImageUrl = libraryImg;

function HomePage() {

  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="device-frame">
        <div className="screen">
          <img
            src={libraryImageUrl}
            alt="Lockwood Library"
            className="lockwood-library-image"
          />
          <h1 className="home-title">Lockwood Library Wayfinder</h1>

          <button className="start-button" onClick={() => navigate("/floors")}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
