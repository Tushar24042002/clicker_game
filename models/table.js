const db = require('./database');
const createTables = () => {
    const usersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        prizes INT DEFAULT 0
      );
    `;
  
    const prizesTableQuery = `
      CREATE TABLE IF NOT EXISTS prizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        prize_name VARCHAR(255),
        date_won TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;
  
    db.query(usersTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table created or already exists.');
      }
    });
  
    db.query(prizesTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating prizes table:', err);
      } else {
        console.log('Prizes table created or already exists.');
      }
    });
  };
  
  // Call the function to create multiple tables
  createTables();

  