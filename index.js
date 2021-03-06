/** 
 * @file The index file creates the Express application, deploys the server and implement API routes.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires './models.js' This file defines data schemas and models.
 * @requires express Makes this application an express application.
 * @requires morgan logs requests made to the database.
 * @requires passport creates strategies for authenticate and authorize requests made to the Api.
 * @requires './auth.js' Implements the user login route.
 * @requires cors Used to control origins from which requests to the server can be made.
 * @requires express-validator Used to perform validation on data provided when creating or updating a user.
 */

const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const {check, validationResult} = require('express-validator');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const cors = require('cors');

let allowedOrigins = ['http://localhost:1234', 'https://movielist11.netlify.app/', 'http://localhost:4200'];

app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixData', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan('common'));

/**
 * GET request to the welcome page ('/') endpoint.
 * @method GET
 * @param {string} URL 
 * @param {requestCallback}
 * @returns {string} Welcome message.
 */ 

app.get('/', (req, res) =>{
  res.send('Welcome to the Movies')
});

/**
 * GET request to the /movies endpoint.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of all movies.
 */

app.get('/movies', (req, res) => {
  Movies.find()
    .then((Movies) => {
      res.status(201).json(Movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * GET request to the /movies/[Title] endpoint.
 * @method GET
 * @param {string} URL
 * @example /movies/Avatar
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing movie details. 
 */

app.get('/movies/:Title', passport.authenticate('jwt', {session: false}),(req, res) =>{
  Movies.findOne({Title: req.params.Title})
    .then((Movie) => {
      res.json(Movie);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * GET request to the /movies/genres/[Name] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /movies/genres/Horror
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing genre info. 
 */

app.get('/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Genre})
    .then((Movie) => {
      res.json(Movie.Genre);
    })
    .catch((error) =>{
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * GET request to the /movies/directors/[Name] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /movies/directors/James Wan
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing director info
 * .
 */

app.get('/directors/:Director', passport.authenticate('jwt', {session: false}), (req, res) =>{
  Movies.findOne({'Director.Name': req.params.Director})
    .then((Movie) => {
      res.json(Movie.Director);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.get('/users', (req, res) =>{
  Users.find()
    .then((Users) => {
      res.json(Users.Username);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * POST request to the /users endpoint to create a new user.
 * @method POST 
 * @param {string} URL
 * @param {object} validationChain validates required information.
 * @param {requestCallback}
 * @returns {Object} An object containing the new user data.
 */

app.post ('/users',
  [
    check('Username', 'Username is required').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Invalid Email').isEmail()
  ], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.Username})
    .then((User) =>{
      if (User){
        return res.status(400).send(req.body.Username + 'already exists');
      } else{
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((User) => {res.status(201).json(User) })
        .catch((error) =>{
          console.error(error);
          res.status(500).send ('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * PUT request to the /users/[Username] endpoint to update user data.
 * @method PUT
 * @param {string} URL
 * @example /users/myusername
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */

app.put ('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  {new: true},
  (error, updatedUser) => {
    if (error) {
      console.error(error),
      res.status(500).send('Error: ' + error);
    } else {
      res.json(updatedUser);
    }
   });
});

/**
 * PUT request to the /users/[Username]/favorites/[MovieID] endpoint.
 * @method PUT 
 * @param {string} URL
 * @example /users/myusername/60a110a28e923350a5340b06
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of the user's favorite movies.
 */

app.post ('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, {
    $push: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (error, updatedUser) => {
    if(error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    } else {
      res.json(updatedUser);
    }
  });
});

/**
 * DELETE request to the /users/[Username]/favorites/[MovieID] endpoint.
 * @method DELETE 
 * @param {string} URL
 * @example /users/myusername/60a110a28e923350a5340b06
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An array of the user's favorite movies.
 */

app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
    $pull: { FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (error,updatedUser) =>{
    if (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    } else {
      res.json(updatedUser);
    }
  })
});

/**
 * GET request to the /users/[Username] endpoint.
 * @method GET 
 * @param {string} URL
 * @example /users/myusername
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {Object} An object containing user data
 */

app.get('/users/:Username', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            if (user === null){
                res.status(404).send("No user found")
            } else {
                res.json(user);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * DELETE request to the /users/[Username] endpoint.
 * @method DELETE
 * @param {string} URL
 * @example /users/myusername
 * @param {authenticationCallback} 
 * @param {requestCallback}
 * @returns {string} A message confirming the user was deleted.
 */

app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove ({Username: req.params.Username})
    .then((User) => {
      if (!User) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' has been deleted.');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('OOPS!')
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log('Listening on port ' + port);
});
