const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');
const { type } = require('os');

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    autoIndex: true,
  })
  .then(() => {
    console.log('DB Connected successfully');
  });

const port = process.env.PORT;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
