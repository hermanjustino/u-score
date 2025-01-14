import React from 'react';
import './App.css';
import Teams from './components/pages/teams';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>U Sports Basketball</h1>
      </header>
      <main>
        <Teams />
      </main>
    </div>
  );
}

export default App;