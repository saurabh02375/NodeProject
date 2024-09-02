const db = require("../database/database");
const multer = require("multer");
const path = require("path");
const tokenjwt = require('../utils/jwtUtils');
const { isEmail } = require('validator'); // Ensure you have validator package installed
const bcrypt = require('bcrypt'); // Ensure you have bcrypt package installed


const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    const uniqueName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const getAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const runAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const allAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else { 
        resolve(rows);
      }
    });
  });
};


exports.loginUser = async (req, res) => {

  try {

    const { username, password } = req.body;
    const users = await allAsync("SELECT * FROM users");
    const user = await users.find((u) => u.username === username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password === password) {

      const gentokens =  await tokenjwt.generateToken();
      return res.status(200).json({ token: gentokens ,  message: 'Login successful', userId: user.id });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.registerUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: `File upload error: ${err.message}` });
    }

    const { username, number, email, password } = req.body;
    const image = req.file;
    let errors = {};

    // Validation
    if (!username) errors.username = "Username is required";
    if (!number) errors.number = "Phone number is required";
    if (!email) {
      errors.email = "Email is required";
    } else if (!isEmail(email)) {
      errors.email = "Invalid email format";
    }
    if (!password) errors.password = "Password is required";
    if (!image) errors.image = "Image is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).send({ errors });
    }

    try {
      // Check if username or email already exists
      const existingUser = await getAsync(
        "SELECT username, email FROM users WHERE username = ? OR email = ?",
        [username, email]
      );
      
      if (existingUser) {
        if (existingUser.username === username) {
          errors.username = "Username already taken";
        }
        if (existingUser.email === email) {
          errors.email = "Email already registered";
        }
        if (Object.keys(errors).length > 0) {
          return res.status(400).send({ errors });
        }
      }

      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      await runAsync(
        "INSERT INTO users (username, number, image, email, password) VALUES (?, ?, ?, ?, ?)",
        [username, number, image.filename, email, hashedPassword]
      );

      // Retrieve all users
      const users = await allAsync("SELECT * FROM users");

      res.status(201).send({
        message: `User ${username} registered successfully`,
        users,
      });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(500).send({ message: "Internal server error: " + err.message });
    }
  });
};
