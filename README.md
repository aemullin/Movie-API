# Movie-API

Movie-API is a RESTful API that communicates with a mongo database to provide the back end for a movie application. The database this API communicates with provides a collection of movie data and a collection of users allowing for user accounts. 

## Technologies used

Node, Express, Mongoose,Passport, jsonwebtoken, MongoDB Atlas, Heroku

## Installation and set-up

- Fork this repository and run 'npm install' in the terminal
- Next, Create a Mongo database through MongoDB Atlas or locally (MongoDB). This data base must contain 2 collections, Movies and Users.
- Then, in the index.js file, update the database URI to the URI of the database you created.
- Finally, run 'npm start' in the terminal. 
