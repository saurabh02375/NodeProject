const db = require("../database/database");
const multer = require("multer");
const path = require("path");

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

    // Find user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password matches
    if (user.password === password) {
      // If using JWTs or sessions, you would handle that here
      return res.status(200).json({ message: 'Login successful', userId: user.id });
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
      return res.status(400).send({ message: err });
    }

    const { username, number, email ,password  } = req.body;
    const image = req.file;

    if (!username) {
      return res.status(400).send("Username is required");
    }

    if (!image) {
      return res.status(400).send("Image is required");
    }

    try {
      // Check if username already exists
      const row = await getAsync("SELECT username FROM users WHERE username = ?", [username]);

      if (row) {
        return res.status(400).send("Username already taken");
      }

      // Insert new user
      await runAsync("INSERT INTO users (username, number, image , email ,password) VALUES (?, ?, ?, ?)", [
        username,
        email,
        number,
        image.filename,
        password
      ]);

      // Retrieve all users
      const users = await allAsync("SELECT * FROM users");

      res.status(201).send({
        message: `User ${username} registered successfully`,
        users,
      });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(500).send("Internal server error: " + err.message);
    }
  });
};
