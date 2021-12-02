const uuid = require('uuid').v4;
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error')
const User = require('../models/user');

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

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()) {
    return next(
      new HttpError('invalid inputs check ur data', 422)
    ) 
  }
  
  const { user, email, password, places } = req.body;

  let existingUser;
  try{
      existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('signing up failed', 500);
    return next(error);
  }

  if(existingUser) {
    const error = new HttpError('user already exists, login instead', 422 )
    return next(error);
  }

  const createdUser = new User( {
    user,
    email,
    image: 'https://cdn-www.realitytea.com/assets/uploads/2016/06/NUP_174107_0154-500x350.jpg',
    password,
    places
  })

  try {
    await createdUser.save();
  } catch(err) {
    const error = new HttpError('sign up failed try again', 500);
    return next(error);
  }

  res.status(201).json({user: createdUser.toObject({ getters: true })})
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
