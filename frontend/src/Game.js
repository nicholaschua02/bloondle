import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import confetti from 'canvas-confetti';


const Game = () => {
  const [dailyVegetable, setDailyVegetable] = useState(null);
  const [vegetables, setVegetables] = useState([]);
  const [vegetableInput, setVegetableInput] = useState('');
  const [filteredVegetables, setFilteredVegetables] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVegetable, setSelectedVegetable] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);

  const inputRef = useRef(null);

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
    axios.get('http://localhost:3001/api/daily-vegetable')
      .then(response => {
        console.log(response.data)
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
    if (gameWon) {
      setMessage('The game is already won!');
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
      calories_per_100g: guessedVegetable.calories_per_100g,
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
        calories_per_100g: guessedVegetable.calories_per_100g === dailyVegetable.calories_per_100g 
          ? true 
          : Math.abs(guessedVegetable.calories_per_100g - dailyVegetable.calories_per_100g) <= 10 
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

    setGuesses([...guesses, feedback]);

    if (feedback.correct.name) {
      setMessage(`Congratulations! You guessed the correct vegetable in ${guesses.length + 1} guesses!`);
      setGameWon(true);
      confetti();
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
        <h1>Welcome to Vegetabledle!</h1>
        <p>Guess the vegetable for today's vegetable.</p>
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
        <button onClick={handleGuess} disabled={gameWon}>Submit Guess</button>
        <button onClick={handleGiveUp} disabled={gameWon}>Give Up</button>
        <p>{message}</p>
        <div className="grid-container">
          <div className="grid-row grid-header">
            <div className="grid-item">Name</div>
            <div className="grid-item">Family</div>
            <div className="grid-item">Origin</div>
            <div className="grid-item">Calories</div>
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
              <div className={`grid-item ${g.correct.calories_per_100g === true ? 'correct' : g.correct.calories_per_100g === "partial" ? 'partial' : 'incorrect'}`}>
                {g.calories_per_100g}{g.correct.calories_per_100g !== true && !g.correct.calories_per_100g && renderArrowNum(g.calories_per_100g, dailyVegetable.calories_per_100g)}
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
      </header>
    </div>
  );
};

export default Game;
