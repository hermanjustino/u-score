import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeGender, setActiveGender] = useState('women');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleGenderChange = (gender) => {
    setActiveGender(gender);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">U Sports Basketball</Link>
        
        {/* Mobile burger menu */}
        <button className="burger-menu" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation menu */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="gender-selector">
            <button 
              className={activeGender === 'women' ? 'active' : ''} 
              onClick={() => handleGenderChange('women')}
            >
              Women
            </button>
            <button 
              className={activeGender === 'men' ? 'active' : ''} 
              onClick={() => handleGenderChange('men')}
            >
              Men
            </button>
          </div>
          
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/scores">Scores</Link></li>
            <li><Link to="/schedule">Schedule</Link></li>
            <li><Link to="/standings">Standings</Link></li>
            <li><Link to="/stats">Stats</Link></li>
            <li><Link to="/teams">Teams</Link></li>
            <li><Link to="/rankings">Rankings</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;