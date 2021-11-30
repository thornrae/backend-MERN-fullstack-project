const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

app.use(express.json());
app.use(cors());

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('could not find this route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if(res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'an unknown error occurred'});
});

mongoose 
  .connect('mongodb+srv://trae:trae@cluster0.cmthy.mongodb.net/places?retryWrites=true&w=majority')
  .then( () => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  })

