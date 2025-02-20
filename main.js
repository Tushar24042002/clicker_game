// server/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const requestIp = require('request-ip');
const { handleButtonClick } = require('./jobs/gameLogic');
const db = require('./models/database');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(requestIp.mw()); 
app.use(express.json());

const getOrCreateUserByIp = (ip) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE ip_address = ?', [ip], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        resolve(results[0]);
      } else {
        // Create new user
        db.query(
          'INSERT INTO users (ip_address, score, prizes) VALUES (?, 0, 0)',
          [ip],
          (err, results) => {
            if (err) return reject(err);
            resolve({ id: results.insertId, ip_address: ip, score: 0, prizes: 0 });
          }
        );
      }
    });
  });
};

app.get('/api/getUserData', async (req, res) => {
  const ip = req.clientIp; 
  try {
    const user = await getOrCreateUserByIp(ip); 
    res.json({
      score: user.score,
      prizes: user.prizes,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/clickButton', async (req, res) => {
  const ip = req.clientIp; 

  try {
    const user = await getOrCreateUserByIp(ip); 
    const result = await handleButtonClick(user.id); 
    res.json(result); 
  } catch (error) {
    console.error('Error processing click:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
