var http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const controller = require("./controller/homecontroller");
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./view");
let users = [];

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", controller.registerUser, (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  if (users.includes(username)) {
    return res.status(400).send("Username already taken");
  }

  users.push(username);
  res.status(201).send(`User ${username} registered successfully`);
});


app.listen(8010, () => {});
