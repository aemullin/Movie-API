const express = require('express'),
  morgan = require('morgan');

const app = express();

let topMovies = [
  {
    title: 'The Hunger Games',
    director: 'Gary Ross'
  },
  {
    title: 'Harry Potter and The Deathly Hallows Pt. 2',
    director: 'David Yates'
  },
  {
    title: 'Avatar',
    director: 'James Cameron'
  },
  {
    title: 'Titanic',
    director: 'James Cameron'
  },
  {
    title: 'Spider-Man: No Way Home',
    director: 'Jon Watts'
  },
  {
    title: 'Jurassic Park',
    director: 'Steven spielberg'
  },
  {
    title: 'Suicide Squad',
    director: 'David Ayer'
  },
  {
    title: 'Deadpool',
    director: 'Tim Miller'
  },
  {
    title: 'No Time to Die',
    director: 'Cary Joji Fukunaga'
  },
  {
    title: 'The Conjuring',
    director: 'James Wan'
  }
];

app.use(morgan('common'));

app.get('/', (req, res) =>{
  res.send('Welcome to the Movies')
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/movies/:title',(req, res) =>{
  res.send('Successful GET request of info on a movie by its title')
});

app.get('/genres/:type', (req, res) => {
  res.send('Successful GET request of genre info by type')
});

app.get ('/directors/:name', (req, res) =>{
  res.send('Successful GET request of director info by name')
});

app.post ('/users', (req, res) => {
  res.send('successful POST request allowing new users to register')
});

app.put ('/users/:username', (req, res) => {
  res.send('successful PUT request allowing user to change username')
});

app.post ('/users/:username/favorites/:title', (req, res) => {
  res.send('successful POST request allowing user to add movie to favorites')
});

app.delete('/users/:username/favorites/:title', (req, res) => {
  res.send('successful DELETE request allowing user to remove movie from favorites')
});

app.delete('/users', (req, res) => {
  res.send('successful DELETE request allowing users to deregister')
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('OOPS!')
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
