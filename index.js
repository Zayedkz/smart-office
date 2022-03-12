const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const path = require('path');
const cors = require('cors')


const login = require('./routes/login')
const rooms = require('./routes/rooms')
const users = require('./routes/users')

const app = express();
app.use(express.json());
// app.use(cors())
process.env.NODE_ENV === 'production';

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token");
    next();
  });

app.use('/api/login', login);
app.use('/api/rooms', rooms);
app.use('/api/users', users);

const db = config.get('mongoURI');

// connect to mongo
mongoose
    .connect(db, { 
        useNewUrlParser: true
     })
    .then(() => console.log('mongodb connected...'))
    .catch(err => console.log(err));

// Serve static assets if in production
// if(process.env.NODE_ENV === 'production') {
//     // set static folder 
//     app.use(express.static('client/build'));
//     app.get('*', (req, res) => { //'*' = anything, any path
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     } );
// }

app.use(express.static('client/build'));
app.get('*', (req, res) => { //'*' = anything, any path
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
} );

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server started on port ${port}`));