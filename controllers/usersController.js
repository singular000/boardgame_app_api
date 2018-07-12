const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// index of users (without email, password, etc)
router.get('/', (req, res) => {
  User.find((err, users) => {
    let mappedUsers = users.map(user => {
      return {
        username: user.username,
        _id: user._id,
        avatar: user.avatar
      }
    });
    if (err) throw err;
    res.json(mappedUsers);
  });
});

// authenticate user upon login, generate jwt
router.post('/login', (req, res) => {
  console.log('request from client: ', req.body)
  if (!req.body.password) {
    res.status(401).send({ message: 'No password provided' })
  } else {
    User.findOne({ username: req.body.username }, (err, foundUser) => {
      if (!foundUser) {
        console.log('Authentication error: no user found');
        res.status(401).send({ message: 'No user found by that name' });
      } else if (foundUser.authenticate(req.body.password)) {
        const token = jwt.sign({
            id: foundUser.id, 
            username: foundUser.username
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        )
        res.json({ status: 200, username: foundUser.username, token: token });
      } else {
        console.log('Authentication error: password does not match');
        res.status(401).send({ message: 'password does not match' })
      }
    });
  }
});

// create user upon signup, generate jwt
router.post('/', (req, res) => {
  console.log('request from client: ', req.body);
  User.create(req.body, (err, createdUser) => {
    if (err) {
      console.log('error saving user: ', err);
      res.status(400).send({message: err.message });
    } else {
      const token = jwt.sign({
          id: createdUser.id, 
          username: createdUser.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      res.json({ status: 201, username: createdUser.username, token: token })
    }
  });
});

module.exports = router;
