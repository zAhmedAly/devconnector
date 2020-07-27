const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    });
    console.log('===> Connected to MongoDB Server ...');
  } catch (err) {
    throw err;
    process.exit(1);
  }
};

module.exports = connectDB;
