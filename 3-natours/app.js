const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
// 1) middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  console.log('hello from middlewar');
  next();
});

// Roures
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// server
module.exports = app;
