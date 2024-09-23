const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAync');
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    data: {
      newUser,
    },
  });
});
