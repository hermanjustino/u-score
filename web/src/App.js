import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/common/Header';
import Home from './components/pages/Home';
import Teams from './components/pages/Teams';
import TeamDetails from './components/pages/TeamDetails';
import Standings from './components/pages/Standings';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/teams/:gender" element={<Teams />} />
            <Route path="/team/:id" element={<TeamDetails />} />
            <Route path="/standings/:gender" element={<Standings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;