import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "../styles/Navbar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Navbar = ({triggerAnimation}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home"); // Track the active link
  

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll to the top
    });
    setActiveLink("home"); // Set Home link as active on scroll
  };

  const handleScrollToContact = () => {
    const contactSection = document.getElementById("contact-us-section");
    contactSection?.scrollIntoView({ behavior: "smooth" });
    triggerAnimation();
    setActiveLink("connect"); 
  };

  return (
    <header className="navbar">
      {/* Logo Section */}
      <div className="logo">
        <div className="target-icon">
          <div className="icon-wrapper">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>
        <span className="logo-primary">Debut</span>
        <span className="logo-secondary">ants.</span>
      </div>

      {/* Navigation Menu */}
      <nav className={`nav-menu ${isMenuOpen ? "show" : ""}`}>
        <ul>
          <li>
            <NavLink
              to="/next-page"
              onClick={scrollToTop}
              className={activeLink === "home" ? "active" : ""}
            >
              <i className="fa-solid fa-house"></i> Home
            </NavLink>
          </li>
          <li>
            <Link
              to="#"
              onClick={handleScrollToContact}
              className={activeLink === "connect" ? "active" : ""}
            >
              <i className="fa-solid fa-link"></i> Connect
            </Link>
          </li>
          <li>
            <NavLink
              to="/"
              className={activeLink === "lock" ? "active" : ""}
              onClick={() => setActiveLink("lock")}
            >
              <i className="fa-solid fa-lock"></i> Lock
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Hamburger Menu Icon */}
      <div
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </header>
  );
};

export default Navbar;
