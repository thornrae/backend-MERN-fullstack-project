const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error')
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;

  try{
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError('fetching users failed', 500 )
    return next(error);
  }
  res.json({users: users.map(user => user.toObject( { getters: true}))})
}

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()) {

    return next(
      new HttpError('invalid inputs check ur data', 422)
    ) 
  }

  const { user, email, password } = req.body;

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

  let hashedPassword;
  
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('could not create user try again', 500);
    return next(error);
  }

  const createdUser = new User( {
    user,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  })

  try {
    await createdUser.save();
  } catch(err) {
    const error = new HttpError('sign up failed try again', 500);
    return next(error);
  }

  console.log('created user..', createdUser)

  let token;
  try {
    token = jwt.sign({
      userId: createdUser.id, 
      email: createdUser.email}, 
      'supersecret_dont_share', 
      {expiresIn:'1hr'}
    );
  } catch(err){
    const error = new HttpError('signing up failed', 500);
    return next(error);
  }
  

  // res.status(201).json({user: createdUser.toObject({ getters: true })})
  res
    .status(201)
    .json({
      userId: createdUser.id, 
      email: createdUser.email, 
      token: token
    })

}

const login = async (req, res, next) => {

  const { email, password } = req.body;
  
  let existingUser;

  try{
      existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('login failed', 500);
    return next(error);
  }
  console.log('existing user', existingUser);


  if(!existingUser) {
    const error = new HttpError (
      'invalid credentials couldnt log you in', 401
    )
    return next(error)
  }

  let isValidPassword=false;
  //returns boolean
  try{
    isValidPassword = await bcrypt.compare(password, existingUser.password);

  } catch(err) {
    const error = new HttpError('couldnt login check ur credz', 500);
    return next(error);
  }

  if(!isValidPassword) {
    const error = new HttpError (
      'invalid credentials couldnt log you in', 401
    )
    return next(error)
  }

  let token;
  try {
    token = jwt.sign({
      userId: existingUser.id, 
      email: existingUser.email}, 
      'supersecret_dont_share', 
      {expiresIn:'1hr'}
    );
  } catch(err){
    const error = new HttpError('loggin in failed', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email, 
    token: token
  })
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
