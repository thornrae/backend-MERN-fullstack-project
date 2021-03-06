const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose')
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');


const HttpError = require('../models/http-error');


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
  res.json({place: place.toObject( { getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  console.log('userId in placesconteoller', userId);

  // let places 
  let userWithPlaces
  try{
    userWithPlaces = await User.findById(userId).populate('places')

  } catch (err) {
    const error = new HttpError('fetching places failed try again later', 500);
    return next(error)
  }

  //if(!places || places.length === 0) {
  if(!userWithPlaces){
    return next(new HttpError('could not find places for provided user id', 404));
  }
  res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) })
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return next( 
      new HttpError('invalid input passed plz check ur data', 422
  ));
  }

  const { title, description, address} = req.body;
  
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
    image: req.file.path,
    creator: req.userData.userId
  });

  let user;

    try {
      user = await User.findById(req.userData.userId);
     console.log('user', user)
    } catch (err) {
      const error = new HttpError('error creating place', 500);
      return next(error);
    }

  if(!user) {
    const error = new HttpError('couldnt find user for provided id', 404);
    return next(error);
  }
  
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    console.log('userplaces in controller', user.places)
    await user.save({session: sess});
    await sess.commitTransaction();

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

  if(place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'ya cant edit this', 
      401
    );
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
    place = await Place.findById(placeId).populate('creator');
  } catch(err) {
    const error = new HttpError('couldnt delete', 500);
    return next(error);
  }
  
  if(!place) {
    const error = new HttpError('couldnt find place for this id', 404)
    return next(error);
  }

  //creator is full user object here
  if(place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'ya cant delete this', 
      403
    );
    return next(error);
  }

  const imagePath = place.image;


  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session: sess})
    //pull removes the id
    place.creator.places.pull(place);
    await place.creator.save({session: sess});
    await sess.commitTransaction();
  } catch(err) {
    const error = new HttpError('couldnt delete place', 500)
    return next(error);
  }
  
  fs.unlink(imagePath, err => {

  });

  res.status(200).json({message: 'deleted place'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;




