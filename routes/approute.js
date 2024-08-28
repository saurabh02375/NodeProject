const express = require('express');
const router = express.Router();
const Home = require('../controller/homecontroller');

router.use(express.json());

router.post('/submit-form',  Home.registerUser);

router.post('/login',  Home.loginUser);



module.exports = router;
