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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try{
    place = await Place.findById(placeId);
  } catch(err) {
    const error = new HttpError('something wrong couldnt find place by that id', 500);
    return next(error);
  }

  if(!place){
    const error =  new HttpError('could not find place for provided place id', 404);
    return next(error);
  } 
  res.json({place: place.toObject( { getters: true }) }); //({place})
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places 
  try{
    places = await Place.find( {creator: userId});

  } catch (err) {
    const error = new HttpError('fetching places failed try again later', 500);
    return next(error)
  }

  if(!places || places.length === 0){
    return next(new HttpError('could not find places for provided user id', 404));
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
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

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    console.log(errors);
    return next(
       new HttpError('invalid input try again')
    )
  }

  const { title, description} = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch(err) {
    const error = new HttpError('could not update', 500);
    return next(error);
  }
 
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch(err) {
    const error = new HttpError('couldnt update', 500);
    return next(error);
  }

  res.status(200).json({place: place.toObject({ getters:true })});
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place 
  try {
    place = Place.findById(placeId);
  } catch(err) {
    const error = new HttpError('couldnt delete', 500);
    return next(error);
  } 

  try {
    await place.remove();
  } catch(err) {
    const error = new HttpError('', )
    return next(error);
  }

  res.status(200).json({message: 'deleted place'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;




