const fs = require('fs');
const path = require('path');


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(cors());

// require('dotenv').config();


const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

app.use(express.urlencoded({extended: true}))


app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use('/uploads/images', express.static(path.join('uploads', 'images')));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
})

// let userName = process.env.DB_USER;
// let password = process.env.DB_PASSWORD;
// let database = process.env.DB_NAME





//general error handling logic
app.use((req, res, next) => {
  if(req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
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
const connectUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cmthy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

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


