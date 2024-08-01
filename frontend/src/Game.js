import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import './App.css';

const MAX_GUESSES = 6;

const Game = () => {
  const [dailyVegetable, setDailyVegetable] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [vegetableInput, setVegetableInput] = useState('');
  const [filteredVegetables, setFilteredVegetables] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVegetable, setSelectedVegetable] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [correctVegetable, setCorrectVegetable] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [giveUpActive, setGiveUpActive] = useState(false);  

  const inputRef = useRef(null);
  const giveUpRef = useRef(null);
  const giveUpTimeout = useRef(null);

  const continents = {
    "Africa": ["North Africa"],
    "Asia": ["China", "India", "Southeast Asia", "Persia", "Central Asia", "East Asia", "Japan"],
    "Europe": ["Italy", "Europe", "Mediterranean", "Greece"],
    "North America": ["Central America", "North America", "Mexico"],
    "South America": ["South America", "Peru"],
    "Australia": ["Australia"],
    "Antarctica": []
  };

  const seasons = ["Winter", "Spring", "Summer", "Autumn"];

  useEffect(() => {
    axios.get('https://vegetabledle-c0197ab79c78.herokuapp.com/api/daily-vegetable')
      .then(response => {
        setDailyVegetable(response.data);
      })
      .catch(error => {
        console.error('Error fetching the daily vegetable:', error);
      });

    axios.get('https://vegetabledle-c0197ab79c78.herokuapp.com/api/vegetables')
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
    if (gameWon) {
      setMessage('The game is already won!');
      return;
    }

    if (guesses.length >= MAX_GUESSES) {
      setMessage('You have reached the maximum number of guesses!');
      return;
    }

    if (!selectedVegetable) {
      setMessage('Please select a valid vegetable name.');
      return;
    }

    if (guesses.some(guess => guess.name === selectedVegetable)) {
      setMessage('You have already made that guess.');
      return;
    }

    const guessedVegetable = vegetables.find(v => v.name === selectedVegetable);

    if (!guessedVegetable) {
      setMessage('Vegetable not found.');
      return;
    }

    const isWithinSameContinent = (origin1, origin2) => {
      for (let continent in continents) {
        if (continents[continent].includes(origin1) && continents[continent].includes(origin2)) {
          return true;
        }
      }
      return false;
    };

    const isAdjacentSeason = (season1, season2) => {
      const index1 = seasons.indexOf(season1);
      const index2 = seasons.indexOf(season2);
      return Math.abs(index1 - index2) === 1 || Math.abs(index1 - index2) === (seasons.length - 1);
    };

    const feedback = {
      name: guessedVegetable.name,
      family: guessedVegetable.family,
      origin: guessedVegetable.origin,
      weight: parseInt(guessedVegetable.weight, 10),
      shape: guessedVegetable.shape,
      texture: guessedVegetable.texture,
      taste: guessedVegetable.taste,
      season: guessedVegetable.season,
      correct: {
        name: guessedVegetable.name === dailyVegetable.name,
        family: guessedVegetable.family === dailyVegetable.family,
        origin: guessedVegetable.origin === dailyVegetable.origin
          ? true
          : dailyVegetable.origin === "Global"
          ? "partial"
          : isWithinSameContinent(guessedVegetable.origin, dailyVegetable.origin)
          ? "partial"
          : false,
        weight: parseInt(guessedVegetable.weight, 10) === parseInt(dailyVegetable.weight, 10)
          ? true 
          : Math.abs(parseInt(guessedVegetable.weight, 10) - parseInt(dailyVegetable.weight, 10)) <= 10 
          ? "partial" 
          : false,
        shape: guessedVegetable.shape === dailyVegetable.shape,
        texture: guessedVegetable.texture === dailyVegetable.texture,
        taste: guessedVegetable.taste === dailyVegetable.taste,
        season: guessedVegetable.season === dailyVegetable.season 
          ? true 
          : isAdjacentSeason(guessedVegetable.season, dailyVegetable.season) 
          ? "partial" 
          : false
      }
    };

    const updatedGuesses = [...guesses, feedback];
    setGuesses(updatedGuesses);

    if (feedback.correct.name) {
      setMessage(`Congratulations! You guessed the correct vegetable in ${updatedGuesses.length} guesses!`);
      setGameWon(true);
      confetti();  // Trigger confetti animation
    } else if (updatedGuesses.length >= MAX_GUESSES) {
      setMessage(`You've run out of guesses! The correct vegetable was`);
      setCorrectVegetable(` ${dailyVegetable.name}`);
      setGameWon(true);
    } else {
      setVegetableInput('');
      setSelectedVegetable('');  // Clear the selectedVegetable state
      setFilteredVegetables(vegetables);
      setMessage('');
    }
  };

  const handleGiveUp = () => {
    setMessage(`The correct vegetable was ${dailyVegetable.name}. Better luck next time!`);
    setGameWon(true);
  };

  const startGiveUpTimer = () => {
    setGiveUpActive(true);
    giveUpRef.current.style.transition = 'width 1s linear';
    giveUpRef.current.style.width = '100%';
    giveUpTimeout.current = setTimeout(() => {
      handleGiveUp();
      resetGiveUpButton();
    }, 1000);
  };

  const resetGiveUpButton = () => {
    clearTimeout(giveUpTimeout.current);
    setGiveUpActive(false);
    giveUpRef.current.style.transition = 'none';
    giveUpRef.current.style.width = '0%';
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
      <div className="background"></div>
      <div className="App-header">
        <h1>Vegetabledle</h1>
        <p>Guess today's vegetable.</p>
        <div className="input-container">
          <label>
            Guess here: <input 
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
              placeholder="e.g. Carrot"
              disabled={gameWon} // Disable input if game is won
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
        <p>Guesses left: {MAX_GUESSES - guesses.length}</p>
        <button className="submit" onClick={handleGuess} disabled={gameWon}>Submit Guess</button>
        <button 
          className={`give-up ${giveUpActive ? 'holding' : ''}`} 
          onMouseDown={startGiveUpTimer} 
          onMouseUp={resetGiveUpButton} 
          onMouseLeave={resetGiveUpButton} 
          disabled={gameWon}
        >
          Give Up (Hold)
          <div className="progress-bar" ref={giveUpRef}></div>
        </button>
        <p>{message}<strong>{correctVegetable}</strong></p>
        <div className="grid-container">
          <div className="grid-row grid-header">
            <div className="grid-item">Name</div>
            <div className="grid-item">Family</div>
            <div className="grid-item">Origin</div>
            <div className="grid-item">Weight (g)</div>
            <div className="grid-item">Shape</div>
            <div className="grid-item">Texture</div>
            <div className="grid-item">Taste</div>
            <div className="grid-item">Season</div>
          </div>
          {guesses.map((g, index) => (
            <div key={index} className="grid-row">
              <div className={`grid-item ${g.correct.name ? 'correct' : 'incorrect'}`}>
                {g.name}{!g.correct.name && renderArrowName(g.name, dailyVegetable.name)}
              </div>
              <div className={`grid-item ${g.correct.family ? 'correct' : 'incorrect'}`}>
                {g.family}
              </div>
              <div className={`grid-item ${g.correct.origin === true ? 'correct' : g.correct.origin === "partial" ? 'partial' : 'incorrect'}`}>
                {g.origin}
              </div>
              <div className={`grid-item ${g.correct.weight === true ? 'correct' : g.correct.weight === "partial" ? 'partial' : 'incorrect'}`}>
                {g.weight}{g.correct.weight !== true && !g.correct.weight && renderArrowNum(g.weight, dailyVegetable.weight)}
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
              <div className={`grid-item ${g.correct.season === true ? 'correct' : g.correct.season === "partial" ? 'partial' : 'incorrect'}`}>
                {g.season}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="credit">
        Background image credit: <a href="https://wall.alphacoders.com/big.php?i=1284104" target="_blank" rel="noopener noreferrer">Alpha Coders</a>
      </div>
    </div>
  );
};

export default Game;
