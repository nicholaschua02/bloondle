import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import Vegetabledle from './Vegetabledle';
import Fruitdle from './Fruitdle';
import Breadle from './Breadle'; // Import the Breadle component

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/vegetabledle" element={<Vegetabledle />} />
                <Route path="/fruitdle" element={<Fruitdle />} />
                <Route path="/breadle" element={<Breadle />} /> {/* Add the route for Breadle */}
            </Routes>
        </Router>
    );
};

export default App;
