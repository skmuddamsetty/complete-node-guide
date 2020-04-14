const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email id!'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide passwordConfirm'],
    validate: {
      // this only works on .create() or .save()!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not matching!',
    },
  },
});

userSchema.pre('save', async function (next) {
  // this keyword refers to the current document and we are checking if the password has been modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // setting this to undefined will not persist this field to database
  this.passwordConfirm = undefined;
  next();
});

// instance method for password comparision
// instance method is a method which is available on all documents
// this here refers to the current document
userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
