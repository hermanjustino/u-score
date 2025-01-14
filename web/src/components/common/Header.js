import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">U Sports</Link>
        
        <nav className="nav-menu">
          <ul className="nav-links">
            <li className="dropdown">
              <Link to="/teams/men">Men</Link>
              <ul className="dropdown-content">
                <li><Link to="/teams/men">Teams</Link></li>
                <li><Link to="/scores/men">Scores</Link></li>
                <li><Link to="/schedule/men">Schedule</Link></li>
                <li><Link to="/standings/men">Standings</Link></li>
                <li><Link to="/stats/men">Stats</Link></li>
                <li><Link to="/rankings/men">Rankings</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/teams/women">Women</Link>
              <ul className="dropdown-content">
                <li><Link to="/teams/women">Teams</Link></li>
                <li><Link to="/scores/women">Scores</Link></li>
                <li><Link to="/schedule/women">Schedule</Link></li>
                <li><Link to="/standings/women">Standings</Link></li>
                <li><Link to="/stats/women">Stats</Link></li>
                <li><Link to="/rankings/women">Rankings</Link></li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;