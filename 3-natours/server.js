const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    autoIndex: true,
  })
  .then(() => {
    console.log('DB Connected successfully');
  });

const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLES REJECTION! Shuting down...');
  server.close(() => {
    process.exit(1);
  });
});
