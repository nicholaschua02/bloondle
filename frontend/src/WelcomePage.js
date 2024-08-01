import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleChoice = (choice) => {
        navigate('/game', { state: { choice } });
    };

    return (
        <div class="App">
            <div class="behind">
                <div className="background"></div>
                <div className="welcome-page">
                    <h2>Welcome to...</h2>
                    <h1>Vegetabledle and Fruitdle!</h1>
                    <button onClick={() => handleChoice('vegetabledle')}>Play Vegetabledle</button>
                    <button onClick={() => handleChoice('fruitdle')}>Play Fruitdle</button>
                </div>

            </div>
            <div className="credit">
                Background image credit: <a href="https://wall.alphacoders.com/big.php?i=1284104" target="_blank" rel="noopener noreferrer">Alpha Coders</a>
            </div>
        </div>
    );
};

export default WelcomePage;
