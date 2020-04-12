const mongoose = require('mongoose');
const dotenv = require('dotenv');

// handling uncaught exception
process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION! Shutting down Server!');
  console.log(err.name, err.message);
  // server.close gives time to the server to finish the requests that are being handled and then the process.exit shutdowns the server.
  process.exit(1);
});

// dotenv will read the files from configuration file and save them to NODEJS environment variables
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connection Successfull'));

// // defining schema using mongoose
// const tourSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'A tour must have a name'],
//     unique: true,
//   },
//   rating: { type: Number, default: 4.5 },
//   price: { type: Number, required: [true, 'A tour must have a price'] },
// });

// // creating Model from Schema
// const Tour = mongoose.model('Tour', tourSchema);

// // create documents using the model created above
// const newTour = new Tour({ name: 'Hilly Hiker', rating: 4, price: 500 });
// newTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(`ERROR ❌:,${err}`));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App Running On Port ${port}`)
);

// used to handle unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down Server!');
  console.log(err.name, err.message);
  // server.close gives time to the server to finish the requests that are being handled and then the process.exit shutdowns the server.
  server.close(() => {
    process.exit(1);
  });
});
