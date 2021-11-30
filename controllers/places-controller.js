const uuid = require('uuid').v4;

const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

const HttpError = require('../models/http-error');

let DUMMY_PLACES = [
  {
    id:'p1',
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

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId;
  });
  if(!places || places.length === 0){
    return next(new HttpError('could not find places for provided user id', 404));
  }
  res.json({places})
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return next( 
      new HttpError('invalid input passed plz check ur data', 422
  ));
  }

  const { title, description, address, creator} = req.body;
  
  let coordinates

  try {
    coordinates = await getCoordsForAddress(address)
    console.log('controller coordinates', coordinates)
  } catch(error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://static1.srcdn.com/wordpress/wp-content/uploads/2021/07/Shannon-Beador-RHOC.jpg',
    creator
  });
  
  try {
    await createdPlace.save();
  } catch(err) {
    const error = new HttpError('creating place failed try again', 500);
    return next(error);
  }

  res.status(201).json({place: createdPlace})
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('invalid input try again')
  }

  const { title, description} = req.body;
  const placeId = req.params.pid;

  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({place: updatedPlace});
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if(!DUMMY_PLACES.find(p => p.id === placeId )) {
    throw new HttpError('couldnt find place w that place id', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id != placeId);
  res.status(200).json({message: 'deleted place'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;




