const express = require('express');

const placesRoutes = require('./routes/places-routes');

const app = express();

app.use('/api/places', placesRoutes);

//MW will run only if the previous function returns an error. Express recognizes when there are 4 parameters instead of the usual 3 as error handling middleware
app.use((error, req, res, next) => {
  if(res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({message: error.message || 'an unknown error occurred'});
});


app.listen(5000);
