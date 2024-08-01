const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const schedule = require('node-schedule');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let vegetables = [];
let dailyVegetable = null;

// Read the CSV file and load the data
fs.createReadStream(path.join(__dirname, 'vegetables.csv'))
  .pipe(csv())
  .on('data', (row) => {
    vegetables.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    setDailyVegetable();
  });

const getRandomVegetable = () => {
  const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
  return vegetable;
};

const setDailyVegetable = () => {
  dailyVegetable = getRandomVegetable();
  console.log(`New daily vegetable set: ${dailyVegetable.name}`);
};

// Schedule the job to run at midnight AWST every day
const timeZone = 'Australia/Perth';
schedule.scheduleJob({ hour: 0, minute: 0, tz: timeZone }, setDailyVegetable);

// Endpoint to get the daily vegetable
app.get('/api/daily-vegetable', (req, res) => {
  res.json(dailyVegetable);
});

// Endpoint to get the list of vegetables
app.get('/api/vegetables', (req, res) => {
  res.json(vegetables);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
