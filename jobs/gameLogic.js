const db = require('../models/database');
const handleButtonClick = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      if (results.length === 0) {
        return reject(new Error('User not found'));
      }
      const user = results[0];
      const randomChance = Math.random(); 
      let prizeWon = false;
      if (randomChance < 0.5 && randomChance > 0.25) {
        user.score += 10;
      }
      else{
      user.score += 1;
      }
      if (randomChance < 0.25) {
        user.prizes += 1;
        prizeWon = true;
      }
      db.query('UPDATE users SET score = ?, prizes = ? WHERE id = ?', [user.score, user.prizes, user.id], (err) => {
        if (err) {
          return reject(err);
        }
        const message = generateMessage(user, prizeWon, randomChance);
        resolve({
          score: user.score,
          prizes: user.prizes,
          message,
        });
      });
    });
  });
};

const generateMessage = (user, prizeWon, randomChance) => {
  if (prizeWon) {
    return 'Congratulations! You won a prize!';
  } else if (randomChance < 0.5) {
    return 'You earned 10 extra points!';
  } else {
    return 'You earned 1 point!';
  }
};

module.exports = { handleButtonClick };
