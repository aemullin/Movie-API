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

let allowedOrigins = [];

app.use(cors({
  origin: (origin, callback) = {
    if(!origin) return callback(null,true);
    if(allowedOrigins.indexOf(origin) === -1){
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixData', { useNewUrlParser: true, useUnifiedTopology: true });
process.env.CONNECTION_URI;

app.use(morgan('common'));

app.get('/', (req, res) =>{
  res.send('Welcome to the Movies')
});

app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((Movies) => {
      res.status(201).json(Movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

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
