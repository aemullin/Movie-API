const express = require('express'),
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
app.get('/movies', (req,res) => {
  res.json(topMovies);
});

