const {validationResult} = require('express-validator');

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

  const createdUser = new User( {
    user,
    email,
    image: 'https://cdn-www.realitytea.com/assets/uploads/2016/06/NUP_174107_0154-500x350.jpg',
    password,
    places: []
  })

  try {
    await createdUser.save();
  } catch(err) {
    const error = new HttpError('sign up failed try again', 500);
    return next(error);
  }

  res.status(201).json({user: createdUser.toObject({ getters: true })})
}

const login = async (req, res, next) => {

  const { email, password} = req.body;
  
  let existingUser;
  try{
      existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError('login failed', 500);
    return next(error);
  }

  if(!existingUser || existingUser.password !== password) {
    const error = new HttpError (
      'invalid credentials couldnt log you in', 401
    )
    return next(error)
  }


  res.json({message: 'logged in', user: existingUser.toObject({getters:true})})
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
