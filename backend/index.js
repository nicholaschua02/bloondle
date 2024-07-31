const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 3001;

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

// Endpoint to get the daily vegetable
app.get('/api/daily-vegetable', (req, res) => {
  const dailyVegetable = getRandomVegetable();
  res.json(dailyVegetable);
});

// Endpoint to get the list of vegetables
app.get('/api/vegetables', (req, res) => {
  res.json(vegetables);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
