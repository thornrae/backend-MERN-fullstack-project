//logic to validate an incoming requests token
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  //Authorization: 'Bearer TOKEN'
  if(req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1]; 
    console.log('mw token', token)
    if(!token) {
      throw new Error('authentication failed');
    }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    console.log('decoded', decodedToken)
    req.userData = {userId: decodedToken.userId}
    console.log('req.userData in check auth mw', req.userData)
    next();

  } catch(err) {
    const error = new HttpError('authentication failed', 401);
    return next(error);
  }
};