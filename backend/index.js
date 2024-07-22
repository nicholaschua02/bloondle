const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Define the possible configurations
const towers = [
  { name: "Dart Monkey", upgrades: ["0-0-0", "1-0-0", "0-1-0", "0-0-1", "1-1-0", "2-0-0", "0-2-0", "0-0-2"] },
  // Add more towers and their upgrade paths here
];

const getRandomTowerConfiguration = () => {
  const tower = towers[Math.floor(Math.random() * towers.length)];
  const upgrade = tower.upgrades[Math.floor(Math.random() * tower.upgrades.length)];
  return { tower: tower.name, upgrade };
};

// Endpoint to get the daily tower configuration
app.get('/api/daily-configuration', (req, res) => {
  const dailyConfiguration = getRandomTowerConfiguration();
  res.json(dailyConfiguration);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
