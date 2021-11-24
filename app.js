const express = require('express');
const app = express();
const cors = require('cors')

app.use(express.json());
app.use(cors());

const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

app.use('/api/places', placesRoutes);

app.use((req, res, next) => {
  const error = new HttpError('could not find this route', 404);
  throw error;

});

//MW will run only if the previous function returns an error. Express recognizes when there are 4 parameters instead of the usual 3 as error handling middleware
app.use((error, req, res, next) => {
  if(res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'an unknown error occurred'});
});


app.listen(5000);
