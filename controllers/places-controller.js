const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
  {
    id: 'p1', 
    title: 'empire state building', 
    description: 'tall ass building',
    location: {
      lat: 40.7484405,
      lon: -73.9878531
    }, 
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
]

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId;
  });
  if(!place){
    return next(new HttpError('could not find place for provided user id', 404));
  }
  res.json({place})
}

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if(!place){
    throw new HttpError('could not find place for provided place id');
  } 
  res.json({place: place}); //({place})
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;




