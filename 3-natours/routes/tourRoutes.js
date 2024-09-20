const express = require('express');
const tourControler = require('./../controllers/tourController');
// tour routes
const router = express.Router();
// router.param("id", tourControler.checkID);

router.route('/').get(tourControler.getAllTours).post(tourControler.CreateTour);
router
  .route('/:id')
  .get(tourControler.getTourById)
  .patch(tourControler.updateTour)
  .delete(tourControler.deletTour);
module.exports = router;
