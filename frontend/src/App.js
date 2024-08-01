import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './Game';
import WelcomePage from './WelcomePage';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default App;
