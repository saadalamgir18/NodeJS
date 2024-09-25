const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAync = require('../utils/catchAync');

exports.getAllReviews = catchAync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.create(req.body);
  if (!review)
    return new AppError(
      'Review not created. There is some issue with body',
      403,
    );

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});
