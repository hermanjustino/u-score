import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/header.css';

const Header = () => {
  const [activeGender, setActiveGender] = useState('women');

  const menuItems = [
    { path: 'teams', label: 'Teams' },
    { path: 'scores', label: 'Scores' },
    { path: 'schedule', label: 'Schedule' },
    { path: 'standings', label: 'Standings' },
    { path: 'stats', label: 'Stats' },
    { path: 'rankings', label: 'Rankings' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">PSRVR</Link>
        
        <nav className="nav-menu">
          <ul className="nav-links">
            {['men', 'women'].map((gender) => (
              <li key={gender} className="dropdown">
                <Link 
                  to={`/teams/${gender}`} 
                  onClick={() => setActiveGender(gender)}
                  className={activeGender === gender ? 'active' : ''}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Link>
                <ul className="dropdown-content">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <Link to={`/${item.path}/${gender}`}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;