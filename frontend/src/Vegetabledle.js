import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import './App.css';

const MAX_GUESSES = 6;

const Vegetabledle = () => {
  const navigate = useNavigate();
  const [dailyItem, setDailyItem] = useState({});
  const [items, setItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [correctItem, setCorrectItem] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [giveUpActive, setGiveUpActive] = useState(false);

  const inputRef = useRef(null);
  const giveUpRef = useRef(null);
  const giveUpTimeout = useRef(null);

  const continents = {
    "Africa": ["North Africa", "Africa"],
    "Asia": ["China", "India", "Southeast Asia", "Persia", "Central Asia", "East Asia", "Japan", "Asia"],
    "Europe": ["Italy", "Europe", "Mediterranean", "Greece", "Europe"],
    "North America": ["Central America", "North America", "Mexico", "North America"],
    "South America": ["South America", "Peru", "South America"],
    "Australia": ["Australia"],
    "Antarctica": ["Antarctica"]
  };

  const seasons = ["Winter", "Spring", "Summer", "Autumn"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dailyResponse = await axios.get("https://vegetabledle-c0197ab79c78.herokuapp.com/api/daily-vegetable");
        setDailyItem(dailyResponse.data);

        const itemsResponse = await axios.get("https://vegetabledle-c0197ab79c78.herokuapp.com/api/vegetables");
        setItems(itemsResponse.data);
        setFilteredItems(itemsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleItemInputChange = (e) => {
    const value = e.target.value;
    setItemInput(value);
    setFilteredItems(
      items.filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
    );
    setShowDropdown(true);  // Show dropdown when typing
  };

  const handleItemSelect = (itemName) => {
    setItemInput(itemName);
    setSelectedItem(itemName);
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

    if (!selectedItem) {
      setMessage('Please select a valid item name.');
      return;
    }

    if (guesses.some(guess => guess.name === selectedItem)) {
      setMessage('You have already made that guess.');
      return;
    }

    const guessedItem = items.find(v => v.name === selectedItem);

    if (!guessedItem) {
      setMessage('Item not found.');
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
      name: guessedItem.name,
      family: guessedItem.family,
      origin: guessedItem.origin,
      weight: parseInt(guessedItem.weight, 10),
      shape: guessedItem.shape,
      texture: guessedItem.texture,
      taste: guessedItem.taste,
      season: guessedItem.season,
      correct: {
        name: guessedItem.name === dailyItem.name,
        family: guessedItem.family === dailyItem.family,
        origin: guessedItem.origin === dailyItem.origin
          ? true
          : dailyItem.origin === "Global"
          ? "partial"
          : isWithinSameContinent(guessedItem.origin, dailyItem.origin)
          ? "partial"
          : false,
        weight: parseInt(guessedItem.weight, 10) === parseInt(dailyItem.weight, 10)
          ? true 
          : Math.abs(parseInt(guessedItem.weight, 10) - parseInt(dailyItem.weight, 10)) <= 10 
          ? "partial" 
          : false,
        shape: guessedItem.shape === dailyItem.shape,
        texture: guessedItem.texture === dailyItem.texture,
        taste: guessedItem.taste === dailyItem.taste,
        season: guessedItem.season === dailyItem.season 
          ? true 
          : isAdjacentSeason(guessedItem.season, dailyItem.season) 
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
      setCorrectItem(` ${dailyItem.name}`);
      setGameWon(true);
    } else {
      setItemInput('');
      setSelectedItem('');  // Clear the selectedItem state
      setFilteredItems(items);
      setMessage('');
    }
  };

  const handleGiveUp = () => {
    setMessage(`The correct vegetable was ${dailyItem.name}. Better luck next time!`);
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
      <button className="back-button" onClick={() => navigate('/')}>
        Return
      </button>
      <div className="background"></div>
      <div className="App-header">
        <h1>Vegetabledle</h1>
        <p>Guess today's vegetable.</p>
        <div className="input-container">
          <label>
            Guess here: <input 
              type="text"
              value={itemInput}
              onChange={handleItemInputChange}
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
                {filteredItems.map((item) => (
                  <li key={item.name} onMouseDown={() => handleItemSelect(item.name)}>
                    {item.name}
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
        <p>{message}<strong>{correctItem}</strong></p>
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
          {Array.isArray(guesses) && guesses.map((g, index) => (
            <div key={index} className="grid-row" style={{ '--delay': `${index * 0.1}s` }}>
              <div className={`grid-item ${g.correct.name ? 'correct' : 'incorrect'}`}>
                {g.name}{!g.correct.name && renderArrowName(g.name, dailyItem.name)}
              </div>
              <div className={`grid-item ${g.correct.family ? 'correct' : 'incorrect'}`}>
                {g.family}
              </div>
              <div className={`grid-item ${g.correct.origin === true ? 'correct' : g.correct.origin === "partial" ? 'partial' : 'incorrect'}`}>
                {g.origin}
              </div>
              <div className={`grid-item ${g.correct.weight === true ? 'correct' : g.correct.weight === "partial" ? 'partial' : 'incorrect'}`}>
                {g.weight}{g.correct.weight !== true && !g.correct.weight && renderArrowNum(g.weight, dailyItem.weight)}
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
      <div className="author-credit">
        Author: Nicholas Chua <a href="https://github.com/nicholaschua02" target="_blank" rel="noopener noreferrer">Github</a>
      </div>
    </div>
  );
};

export default Vegetabledle;
