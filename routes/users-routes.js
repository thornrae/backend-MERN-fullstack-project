const express = require('express');
const {check} = require('express-validator');

const usersControllers = require('../controllers/users-controller');

const HttpError = require('../models/http-error');

const router = express.Router();

router.get('/', usersControllers.getUsers);

router.post('/signup', [
  check('user')
    .not()
    .isEmpty(),
  check('email')
    .normalizeEmail()
    .isEmail(),
  check('password')
    .isLength({min:6})
] ,usersControllers.signup);

router.post('/login', usersControllers.login);



module.exports = router;