const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: true,
    minLength: [8, 'please enter min 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
