const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const email = require('surge/lib/middleware/email');
const crypto = require('crypto');

const createToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statuseCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  const token = createToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statuseCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exits
  if (!email || !password) {
    return next(new AppError('Please privide email and password'), 400);
  }
  const user = await User.findOne({ email }).select('+password');

  // check if user exist and password is correct
  if (!user || !(await user.correctPassword(password, user?.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //if everything ok send token to clent
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  const cookiesOption = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'loggedOut', cookiesOption);
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1. get ting the token and check if exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    next(new AppError('You are not logged in! Please log in to access.', 401));

  // 2. varification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3. check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    next(
      new AppError(
        'The user belonging to this this token no longer exist.',
        401,
      ),
    );

  //4. check if user change password after the jwt was issues
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changes password! Please login again'),
    );
  }
  req.user = currentUser;
  // Grant access to protected route
  next();
});

// only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies?.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) next();

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      req.locals.user = currentUser;
      return next();
      next();
    } catch (error) {
      return next();
    }
  }
};

exports.restricttTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with this email!', 404));

  // 2. genrate the random token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a request with your new password and
   passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore 
   this email!`;
  console.log(message);
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error while send email, try again latter',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // 2. if token has nnot expired and there user set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // 3. update changepasswordat property for the user
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 4. log the user in and send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2. check if the posted is correct
  const { password, passwordCurrent, passwordConfirm } = req.body;
  if (!user || !(await user.correctPassword(passwordCurrent, user?.password)))
    return next(new AppError('you current password is wrong!', 401));

  // if so update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // login user in send jwt
  createSendToken(user, 200, res);
});
