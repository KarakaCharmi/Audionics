import React, { useState } from 'react';
import '../styles/contact.css';
import { FaUser, FaEnvelope, FaComment } from 'react-icons/fa'; // Import icons
import { ReactComponent as EarthAnimation } from '../assets/earth-animation.svg'; // Import the SVG as a component
import { FaLinkedin,FaFacebook, FaInstagram,FaGithub } from 'react-icons/fa'; // Import social media icons

const ContactUsPage = ({animationKey}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Message Sent Successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="divider-container">
        <div className="divider-line"></div>
        <span className="divider-text">Connect with us</span>
        <div className="divider-line"></div>
      </div>
      <section className="contact-section" id="contact-us-section">
        <div className="svg-container">
          <EarthAnimation className="earth-animation-svg" id="earth-animation-svg" key={animationKey}/> {/* Use the imported SVG component */}
        </div>
        <div className="contact-form-container">
          <h2>Get in Touch</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            {/* Name Field */}
            <div className="form-field">
              <label htmlFor="name">
                <FaUser className="icon" />
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">
                <FaEnvelope className="icon" />
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="message">
                <FaComment className="icon" />
              </label>
              <textarea
                name="message"
                id="message"
                placeholder="Type your message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Project Audionics.</p>
          <div className="footer-links">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebook size={30} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedin size={30} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram size={30} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaGithub size={30} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUsPage;
