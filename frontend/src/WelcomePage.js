import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleChoice = (choice) => {
        navigate(`/${choice}`);
    };

    const text1 = 'Foodle!';

    return (
        <div className="App">
            <div className="behind">
                <div className="background"></div>
                <div className="welcome-page">
                    <h2>Welcome to...</h2>
                    <h1>
                        {text1.split('').map((char, index) => (
                            <span key={index} className="cycle-color">{char}</span>
                        ))}
                    </h1>
                    <div className="page-links">
                        <button className="game-button vegetabledle" onClick={() => handleChoice('vegetabledle')}>Play Vegetabledle</button>
                        <button className="game-button fruitdle" onClick={() => handleChoice('fruitdle')}>Play Fruitdle</button>
                        <button className="game-button breadle" onClick={() => handleChoice('breadle')}>Play Breadle</button>
                    </div>
                </div>
            </div>
            <div className="credit">
                Background image credit: <a href="https://wall.alphacoders.com/big.php?i=1284104" target="_blank" rel="noopener noreferrer">Alpha Coders</a>
            </div>
            <div className="author-credit">
                Author: Nicholas Chua <a href="https://github.com/nicholaschua02" target="_blank" rel="noopener noreferrer">Github</a>
            </div>
        </div>
    );
};

export default WelcomePage;
