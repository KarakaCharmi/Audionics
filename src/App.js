import React,{useState} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import NextPage from "./components/NextPage";  // Your next page component
import Navbar from "./components/Navbar";

import ContactUsPage from "./components/ContactUsPage";
function App() {
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = () => {
    setAnimationKey((prevKey) => prevKey + 1);
  };
  return (
    <Router>
      {/* Conditionally render Navbar based on route */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/next-page" element={<><Navbar triggerAnimation={triggerAnimation}/><NextPage /> <ContactUsPage animationKey={animationKey}/></>} />
        {/* <Route path="/about" element={<><Navbar /><ContactUsPage /></>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
