import "./HomePage.css";

interface HomePageProps {
  onStart: () => void;
}

import libraryImg from "../assets/lockwood-library.jpg";
const libraryImageUrl = libraryImg;

function HomePage({ onStart }: HomePageProps) {
  // Placeholder image. Replace with a local asset when available.

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
          <button className="start-button" onClick={onStart}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
