const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyD3Hssdh4eK9_NIpKseBh1Wx9pJsch1cgA';

async function getCoordsForAddress(address) {
  
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
  );

  const data = response.data;
  console.log(data);

  if(!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError('could not find location for given address', 422
    );
    throw error;
  };

  const coordinates = data.results[0].geometry.location;

  return coordinates;


}

module.exports = getCoordsForAddress;