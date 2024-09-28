const express = require('express');
const tourControler = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRoutes = require('./reviewRoutes');
// tour routes
const router = express.Router();
// router.param("id", tourControler.checkID);
router.use('/:tourId/reviews', reviewRoutes);
router
  .route('/top-5-cheap')
  .get(tourControler.aliasTopTours, tourControler.getAllTours);

router.route('/tour-stats').get(tourControler.getTourStates);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restricttTo('admin', 'lead-guid', 'guid'),
    tourControler.getMonthlyPlan,
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControler.getToursWith);
router.route('/distances/:latlng/unit/:unit').get(tourControler.getDistances);
router
  .route('/')
  .get(tourControler.getAllTours)
  .post(
    authController.protect,
    authController.restricttTo('admin', 'lead-guid'),
    tourControler.CreateTour,
  );
router
  .route('/:id')
  .get(tourControler.getTourById)
  .patch(
    authController.protect,
    authController.restricttTo('admin', 'lead-guid'),
    tourControler.updateTour,
  )
  .delete(
    authController.protect,
    authController.restricttTo('admin', 'lead-guid'),
    tourControler.deletTour,
  );

module.exports = router;
