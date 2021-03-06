/**
 * @file The auth file implements the user login route for users that are registered.
 * @requires passport creates strategies for authenticate and authorize requests made to the Api.
 * @requires './passport.js' The file creating the passport strategies
 * @requires jsonwebtoken Used to create JSON web tokens that will authorize protected API requests
 */

const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

  /**
 * Generates a JSON web token
 * @function generateJWTToken 
 * @param {*} user - Authenticated user provided by passport
 * @returns {string} Web token
 */

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

/**
 * Exports a POST request to the /login endpoint for logging in a registered user and assigning them a JSON token.
 * @function
 * @param {*} app The express app created in the index file.
 * @returns {Object} An object containing user login data and the JSON token.
 */

module.exports = (router) => {
  router.post('/login', (req,res) => {
    passport.authenticate('local', {session: false}, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'something is not right',
          user: user
        });
      }
      req.login(user, {session: false}, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({user, token});
      });
    }) (req,res);
  });
}
