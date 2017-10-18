const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  //user has alredady had their email and password auth'd
  //user needs a token
  res.send({ token: tokenForUser(req.user) });
}
exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide both a email and a password' })
  }
//check if a user with given email exists in db
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    //if user does exist, return an error (no dupes)
    if (existingUser) {
      return res.status(422).send({ error: 'Email is already in use' });
    }
    //if a user with email does not exist, create and save user record
    const user = new User({
      email: email,
      password: password
    });

    user.save(function(err) {
      //respond to request indicating the user was created
      res.json({ token: tokenForUser(user) });
    });
  });
}
