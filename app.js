const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

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

// const options = { useNewUrlParser: true, useUnifiedTopology: true};
const connectUrl = 'mongodb+srv://trailer:rolyat@cluster0.cmthy.mongodb.net/places?retryWrites=true&w=majority';

const connectConfig = {
  useNewUrlParser: true, 
  useUnifiedTopology: true
}

mongoose 
  .connect(connectUrl, connectConfig)
  .then( () => {
    console.log('connected to db?')
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });


