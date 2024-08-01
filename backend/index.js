const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let vegetables = [];

// Read the CSV file and load the data
fs.createReadStream(path.join(__dirname, 'vegetables.csv'))
  .pipe(csv())
  .on('data', (row) => {
    vegetables.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

const getRandomVegetable = () => {
  const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
  return vegetable;
};

let dailyVegetable = getRandomVegetable();

// Function to reset the daily vegetable at midnight
const resetDailyVegetable = () => {
  dailyVegetable = getRandomVegetable();
  console.log('New daily vegetable set:', dailyVegetable.name);
};

// Calculate the time until midnight
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0);

const timeUntilMidnight = midnight.getTime() - now.getTime();

// Set a timeout to reset the daily vegetable at midnight
setTimeout(() => {
  resetDailyVegetable();
  setInterval(resetDailyVegetable, 24 * 60 * 60 * 1000);
}, timeUntilMidnight);

// Endpoint to get the daily vegetable
app.get('/api/daily-vegetable', (req, res) => {
  res.json(dailyVegetable);
});

// Endpoint to get the list of vegetables
app.get('/api/vegetables', (req, res) => {
  res.json(vegetables);
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch all handler to serve the React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
