const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the path to the database file
const dbPath = path.resolve(__dirname, "mydatabase.db");

// Open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");

    // Create the users table if it does not exist
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      },
    );
  }
});

module.exports = db;
