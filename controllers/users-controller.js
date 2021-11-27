const uuid = require('uuid').v4;
const {validationResult} = require('express-validator')

const HttpError = require('../models/http-error')

const DUMMY_USERS = [
  {
    id: 'u1',
    user: 'toasty',
    email: 'tt@test.com',
    password: 'testers'
  }
];

const getUsers = (req, res, next) => {
  res.status(200).json({users: DUMMY_USERS})
}

const signup = (req, res, next) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()) {
    throw new HttpError('invalid inputs check ur data', 422)
  }
  
  const { user, email, password } = req.body;

  const hasUser = DUMMY_USERS.find(u => u.email === email);
  if(hasUser) {
    throw new HttpError('this email already exists', 422);
  }

  const createdUser = {
    id: uuid(),
    user: user,
    email: email, 
    password: password
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({user: createdUser})
}

const login = (req, res, next) => {
  const { email, password} = req.body;
  
  const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  if(!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError('could not id user, creds wrong', 401);
  }

  res.json({message: 'logged in'})
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
