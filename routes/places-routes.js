const express = require('express');

const router = express.Router();

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

router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if(!place){
    const error = new Error('could not find place for provided place id');
    error.code = 404;
    throw error
  } 
  res.json({place: place}); //({place})
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId;
  });
  if(!place){
    const error = new Error('could not find place for provided user id');
    error.code = 404;
    return next(error);
  }

  res.json({place})
});


module.exports = router;