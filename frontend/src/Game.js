import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const Game = () => {
  const [dailyVegetable, setDailyVegetable] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [vegetableInput, setVegetableInput] = useState('');
  const [filteredVegetables, setFilteredVegetables] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVegetable, setSelectedVegetable] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/daily-vegetable')
      .then(response => {
        setDailyVegetable(response.data);
      })
      .catch(error => {
        console.error('Error fetching the daily vegetable:', error);
      });

    axios.get('http://localhost:3001/api/vegetables')
      .then(response => {
        setVegetables(response.data);
        setFilteredVegetables(response.data);  // Initialize filteredVegetables with all vegetables
      })
      .catch(error => {
        console.error('Error fetching vegetables:', error);
      });
  }, []);

  const handleVegetableInputChange = (e) => {
    const value = e.target.value;
    setVegetableInput(value);
    setFilteredVegetables(
      vegetables.filter(vegetable => vegetable.name.toLowerCase().includes(value.toLowerCase()))
    );
    setShowDropdown(true);  // Show dropdown when typing
  };

  const handleVegetableSelect = (vegetableName) => {
    setVegetableInput(vegetableName);
    setSelectedVegetable(vegetableName);
    setShowDropdown(false);  // Hide dropdown after selection
  };

  const handleGuess = () => {
    if (guesses.length >= 6) {
      setMessage('You have reached the maximum number of guesses!');
      return;
    }

    if (!selectedVegetable) {
      setMessage('Please select a valid vegetable name.');
      return;
    }

    const guessedVegetable = vegetables.find(v => v.name === selectedVegetable);

    if (!guessedVegetable) {
      setMessage('Vegetable not found.');
      return;
    }

    const feedback = {
      name: guessedVegetable.name,
      family: guessedVegetable.family,
      origin: guessedVegetable.origin,
      calories_per_100g: guessedVegetable.calories_per_100g,
      shape: guessedVegetable.shape,
      texture: guessedVegetable.texture,
      taste: guessedVegetable.taste,
      season: guessedVegetable.season,
      correct: {
        name: guessedVegetable.name === dailyVegetable.name,
        family: guessedVegetable.family === dailyVegetable.family,
        origin: guessedVegetable.origin === dailyVegetable.origin,
        calories_per_100g: guessedVegetable.calories_per_100g === dailyVegetable.calories_per_100g,
        shape: guessedVegetable.shape === dailyVegetable.shape,
        texture: guessedVegetable.texture === dailyVegetable.texture,
        taste: guessedVegetable.taste === dailyVegetable.taste,
        season: guessedVegetable.season === dailyVegetable.season
      }
    };

    setGuesses([...guesses, feedback]);
    setMessage('');
  };

  const renderArrowName = (currentValue, targetValue) => {
    if (currentValue < targetValue) {
      return ' ↓';
    } else if (currentValue > targetValue) {
      return ' ↑';
    }
    return '';
  };

  const renderArrowNum = (currentValue, targetValue) => {
    if (currentValue < targetValue) {
      return ' ↑';
    } else if (currentValue > targetValue) {
      return ' ↓';
    }
    return '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Guess the Vegetable</h1>
        <p>Guess the vegetable configuration for today's vegetable.</p>
        <div className="input-container">
          <label>
            Vegetable: <input 
              type="text"
              value={vegetableInput}
              onChange={handleVegetableInputChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowDropdown(false);
                }, 100);
              }}
              ref={inputRef}
              placeholder="Start typing to filter vegetables"
            />
            {showDropdown && (
              <ul className="dropdown">
                {filteredVegetables.map((vegetable) => (
                  <li key={vegetable.name} onMouseDown={() => handleVegetableSelect(vegetable.name)}>
                    {vegetable.name}
                  </li>
                ))}
              </ul>
            )}
          </label>
        </div>
        <button onClick={handleGuess}>Submit Guess</button>
        <p>{message}</p>
        <div className="grid-container">
          {guesses.map((g, index) => (
            <div key={index} className="grid-row">
              <div className={`grid-item ${g.correct.name ? 'correct' : 'incorrect'}`}>
                {g.name}{!g.correct.name && renderArrowName(g.name, dailyVegetable.name)}
              </div>
              <div className={`grid-item ${g.correct.family ? 'correct' : 'incorrect'}`}>
                {g.family}
              </div>
              <div className={`grid-item ${g.correct.origin ? 'correct' : 'incorrect'}`}>
                {g.origin}
              </div>
              <div className={`grid-item ${g.correct.calories_per_100g ? 'correct' : 'incorrect'}`}>
                {g.calories_per_100g}{!g.correct.calories_per_100g && renderArrowNum(g.calories_per_100g, dailyVegetable.calories_per_100g)}
              </div>
              <div className={`grid-item ${g.correct.shape ? 'correct' : 'incorrect'}`}>
                {g.shape}
              </div>
              <div className={`grid-item ${g.correct.texture ? 'correct' : 'incorrect'}`}>
                {g.texture}
              </div>
              <div className={`grid-item ${g.correct.taste ? 'correct' : 'incorrect'}`}>
                {g.taste}
              </div>
              <div className={`grid-item ${g.correct.season ? 'correct' : 'incorrect'}`}>
                {g.season}
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
};

export default Game;
