// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid'); 
const { handleButtonClick } = require('./jobs/gameLogic');
const db = require('./models/database');
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  methods: ['GET', 'POST'],
  credentials: true, 
};

app.use(cors());

// app.use(cors());
app.use(express.json());
app.use(cookieParser());


const getOrCreateUserByUniqueId = (uniqueId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE unique_id = ?', [uniqueId], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        resolve(results[0]);
      } else {
        db.query(
          'INSERT INTO users (unique_id, score, prizes) VALUES (?, 0, 0)',
          [uniqueId],
          (err, results) => {
            if (err) return reject(err);
            resolve({ id: results.insertId, unique_id: uniqueId, score: 0, prizes: 0 });
          }
        );
      }
    });
  });
};

app.get('/api/getUserData', async (req, res) => {
  let uniqueId = req.query.id;
  if (!uniqueId) {
    uniqueId = uuidv4();  
    res.cookie('uniqueId', uniqueId, { maxAge: 86400000});
  }

  try {
    const user = await getOrCreateUserByUniqueId(uniqueId);
    res.json({
      score: user.score,
      prizes: user.prizes,
      id : uniqueId
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/clickButton', async (req, res) => {
  let uniqueId = req.cookies.uniqueId;
  if (!uniqueId) {
    uniqueId = uuidv4(); 
    res.cookie('uniqueId', uniqueId, { maxAge: 86400000 }); 
  }

  try {
    const user = await getOrCreateUserByUniqueId(uniqueId);
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
