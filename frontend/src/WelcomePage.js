import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const WelcomePage = () => {
    const navigate = useNavigate();

    const handleChoice = (choice) => {
        navigate('/game', { state: { choice } });
    };

    const text1 = 'Vegetabledle';
    const text2 = 'and';
    const text3 = 'Fruitdle!';

    return (
        <div className="App">
            <div className="behind">
                <div className="background"></div>
                <div className="welcome-page">
                    <h2>Welcome to...</h2>
                    <h1>
                        {text1.split('').map((char, index) => (
                            <span key={index} className="cycle-color">{char}</span>
                        ))} {text2.split('').map((char, index) => (
                            <span key={index} className="cycle-color">{char}</span>
                        ))} {text3.split('').map((char, index) => (
                            <span key={index} className="cycle-color">{char}</span>
                        ))}
                    </h1>
                    <button onClick={() => handleChoice('vegetabledle')}>Play Vegetabledle</button>
                    <button onClick={() => handleChoice('fruitdle')}>Play Fruitdle</button>
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
