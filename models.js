/**
 * @file The models file implements schemas for documents held in the movies and users collections in the myFlix database. These schemas will be used to create models that will be used to make API requests
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires bcrypt Provides encryption to user passwords.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema  = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

/**
 * Method for encrypting user passwords.
 * @method hashPassword
 * @param {*} password - The password that is provided in the request.
 * @returns {string} String containing the encrypted password.
 */


userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Method for validating a users password compared to the encrypted password in the database.
 * @method validatePassword
 * @param {*} password - Password provided in the login request.
 * @returns {boolean} True if user password matches with the encrypted password.
 */

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
