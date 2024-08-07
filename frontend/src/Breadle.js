import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import './App.css';

const MAX_GUESSES = 6;

const Breadle = () => {
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
    "Africa": [
      "North Africa", "Africa", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
      "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea",
      "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia",
      "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
      "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo",
      "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ],
    "Asia": [
      "China", "India", "Southeast Asia", "Persia", "Central Asia", "East Asia", "Japan", "Asia", "Afghanistan", "Armenia", "Azerbaijan",
      "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "Georgia", "Indonesia", "Iran", "Iraq", "Israel", "Jordan", "Kazakhstan",
      "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan",
      "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Tajikistan", "Thailand", "Timor-Leste",
      "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"
    ],
    "Europe": [
      "Italy", "Europe", "Mediterranean", "Greece", "France", "Germany", "Spain", "United Kingdom", "Russia", "Netherlands", "Belgium", "Sweden",
      "Switzerland", "Austria", "Norway", "Denmark", "Poland", "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Bosnia and Herzegovina",
      "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Estonia", "Finland", "Georgia", "Hungary", "Iceland", "Ireland", "Kosovo", "Latvia",
      "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "North Macedonia", "Portugal", "Romania", "San Marino",
      "Serbia", "Slovakia", "Slovenia", "Ukraine", "Vatican City"
    ],
    "North America": [
      "Central America", "North America", "Mexico", "United States", "Canada", "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Costa Rica",
      "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Nicaragua", "Panama",
      "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago"
    ],
    "South America": [
      "South America", "Peru", "Brazil", "Argentina", "Chile", "Colombia", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Guyana",
      "Suriname"
    ],
    "Australia": ["Australia", "New Zealand", "Fiji", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Vanuatu", "Kiribati", "Micronesia", "Palau", "Nauru", "Tuvalu", "Marshall Islands"],
    "Antarctica": ["Antarctica"]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dailyResponse = await axios.get("https://foodle-edb3db9dd381.herokuapp.com/api/daily-bread");
        setDailyItem(dailyResponse.data);

        const itemsResponse = await axios.get("https://foodle-edb3db9dd381.herokuapp.com/api/breads");
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

    const feedback = {
      name: guessedItem.name,
      origin: guessedItem.origin,
      mainIngredient: guessedItem.mainIngredient,
      crustTexture: guessedItem.crustTexture,
      crumbTexture: guessedItem.crumbTexture,
      shape: guessedItem.shape,
      taste: guessedItem.taste,
      commonUse: guessedItem.commonUse,
      correct: {
        name: guessedItem.name === dailyItem.name,
        origin: guessedItem.origin === dailyItem.origin,
        mainIngredient: guessedItem.mainIngredient === dailyItem.mainIngredient,
        crustTexture: guessedItem.crustTexture === dailyItem.crustTexture,
        crumbTexture: guessedItem.crumbTexture === dailyItem.crumbTexture,
        shape: guessedItem.shape === dailyItem.shape,
        taste: guessedItem.taste === dailyItem.taste,
        commonUse: guessedItem.commonUse === dailyItem.commonUse
      }
    };

    const updatedGuesses = [...guesses, feedback];
    setGuesses(updatedGuesses);

    if (feedback.correct.name) {
      setMessage(`Congratulations! You guessed the correct bread in ${updatedGuesses.length} guesses!`);
      setGameWon(true);
      confetti();  // Trigger confetti animation
    } else if (updatedGuesses.length >= MAX_GUESSES) {
      setMessage(`You've run out of guesses! The correct bread was`);
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
    setMessage(`The correct bread was ${dailyItem.name}. Better luck next time!`);
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
        <h1>Breadle</h1>
        <p>Guess today's bread.</p>
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
              placeholder="e.g. Baguette"
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
            <div className="grid-item">Origin</div>
            <div className="grid-item">Main Ingredient</div>
            <div className="grid-item">Crust Texture</div>
            <div className="grid-item">Crumb Texture</div>
            <div className="grid-item">Shape</div>
            <div className="grid-item">Taste</div>
            <div className="grid-item">Common Use</div>
          </div>
          {Array.isArray(guesses) && guesses.map((g, index) => (
            <div key={index} className="grid-row" style={{ '--delay': `${index * 0.1}s` }}>
              <div className={`grid-item ${g.correct.name ? 'correct' : 'incorrect'}`}>
                {g.name}{!g.correct.name && renderArrowName(g.name, dailyItem.name)}
              </div>
              <div className={`grid-item ${g.correct.origin ? 'correct' : 'incorrect'}`}>
                {g.origin}
              </div>
              <div className={`grid-item ${g.correct.mainIngredient ? 'correct' : 'incorrect'}`}>
                {g.mainIngredient}
              </div>
              <div className={`grid-item ${g.correct.crustTexture ? 'correct' : 'incorrect'}`}>
                {g.crustTexture}
              </div>
              <div className={`grid-item ${g.correct.crumbTexture ? 'correct' : 'incorrect'}`}>
                {g.crumbTexture}
              </div>
              <div className={`grid-item ${g.correct.shape ? 'correct' : 'incorrect'}`}>
                {g.shape}
              </div>
              <div className={`grid-item ${g.correct.taste ? 'correct' : 'incorrect'}`}>
                {g.taste}
              </div>
              <div className={`grid-item ${g.correct.commonUse ? 'correct' : 'incorrect'}`}>
                {g.commonUse}
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

export default Breadle;
