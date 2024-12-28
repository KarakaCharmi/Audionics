import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css"; // Updated CSS for new styles
import "@fortawesome/fontawesome-free/css/all.min.css";

const HomePage = () => {
  const [isSliding, setIsSliding] = useState(false);
  const navigate = useNavigate();
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const SWIPE_THRESHOLD = 25; // Minimum swipe distance
  const SLIDE_DURATION = 1000; // Duration of slide animation in milliseconds

  // Combined handler for touch and mouse events
  const handleStart = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    touchStartY.current = y;
  };

  const handleMove = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    touchEndY.current = y;
  };

  const handleEnd = () => {
    const swipeDistance = touchStartY.current - touchEndY.current;
    if (swipeDistance > SWIPE_THRESHOLD) {
      handleSlide();
    }
  };

  const handleSlide = () => {
    setIsSliding(true);
    // Wait for slide duration to complete before navigating
    setTimeout(() => {
      navigate("/next-page"); // Replace with the actual route to the next page
    }, SLIDE_DURATION);
  };

  return (
    <div
      className={`home-page ${isSliding ? "slide-up" : ""}`}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
    >
      <div className="content">
        <div className="logo">
          {/* <img
            src="path-to-your-logo.png" 
            alt="Logo"
            className="logo-img hover-zoom"
          /> */}
        </div>
        <div className="animated-text fade-in">Welcome to Audionics</div>
        <div className="team-name slide-in">Team Debutants</div>
        <div className="slide-container">
          <i
            className="fa-solid fa-angles-up slide-icon bounce"
            role="button"
            tabIndex="0"
            onClick={handleSlide}
            onKeyDown={(e) => e.key === "Enter" && handleSlide()}
          ></i>
          <span className="slide-text">Slide Up</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
