const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; // Use a secure key and store it in an environment variable

// Generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Verify a JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
