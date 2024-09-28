const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// user router

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
// all routes after this are protected
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);
router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.route('/').get(userController.getAllUsers);
// .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restricttTo('admin'), userController.deleteUser);

module.exports = router;
