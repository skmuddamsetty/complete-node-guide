const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
app.listen(port, () => console.log(`App Running On Port ${port}`));
