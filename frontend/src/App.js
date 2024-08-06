import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import Vegetabledle from './Vegetabledle';
import Fruitdle from './Fruitdle';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/vegetabledle" element={<Vegetabledle />} />
        <Route path="/fruitdle" element={<Fruitdle />} />
      </Routes>
    </Router>
  );
};

export default App;
