import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/common/Header';
import Home from './components/pages/Home';
import Teams from './components/pages/Teams';
import TeamDetails from './components/pages/TeamDetails';

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;