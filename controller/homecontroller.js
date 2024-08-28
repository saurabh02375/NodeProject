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

const registerUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }

    const { username, number, email } = req.body;
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
      await runAsync("INSERT INTO users (username, image, number, email) VALUES (?, ?, ?, ?)", [
        username,
        image.filename,
        number,
        email
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

module.exports = {
  registerUser,
};
