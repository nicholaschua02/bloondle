import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Game = () => {
  const [dailyConfiguration, setDailyConfiguration] = useState(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/daily-configuration')
      .then(response => {
        setDailyConfiguration(response.data);
      })
      .catch(error => {
        console.error('Error fetching the daily configuration:', error);
      });
  }, []);

  const handleGuess = () => {
    if (guess.toLowerCase() === `${dailyConfiguration.tower.toLowerCase()} ${dailyConfiguration.upgrade}`) {
      setMessage('Correct!');
    } else {
      setMessage('Try Again!');
    }
  };

  if (!dailyConfiguration) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Guess the Tower Upgrade</h1>
      <p>Guess the upgrade configuration for today's tower.</p>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="e.g., Dart Monkey 1-1-0"
      />
      <button onClick={handleGuess}>Submit Guess</button>
      <p>{message}</p>
    </div>
  );
};

export default Game;
