const express = require('express');
const tourControler = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
// tour routes
const router = express.Router();
// router.param("id", tourControler.checkID);
router
  .route('/top-5-cheap')
  .get(tourControler.aliasTopTours, tourControler.getAllTours);

router.route('/tour-stats').get(tourControler.getTourStates);
router.route('/monthly-plan/:year').get(tourControler.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourControler.getAllTours)
  .post(tourControler.CreateTour);
router
  .route('/:id')
  .get(tourControler.getTourById)
  .patch(tourControler.updateTour)
  .delete(
    authController.protect,
    authController.restricttTo('admin', 'lead-guid'),
    tourControler.deletTour,
  );

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restricttTo('user'),
    reviewController.createReview,
  );
module.exports = router;
