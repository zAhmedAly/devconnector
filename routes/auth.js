const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');
const normalizeUrl = require('normalize-url');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const auth = require('../middleware/authCheck');

//  USER LOGIN
//  POST    /api/auth/login
//  PUBLIC

router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.status(401).json({ msg: 'Invalid Credientals' });

      const isMatching = await bcrypt.compare(password, user.password);

      if (!isMatching)
        return res.status(401).json({ msg: 'Invalid Credientals' });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

//  USER REGISTER
//  POST    /api/auth/register
//  PUBLIC

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    console.log('BEFORE try catch');

    try {
      let user = await User.findOne({ email });

      if (user) req.status(400).json({ msg: 'User already exists' });

      console.log('BEFORE normalizeUrl');

      const avatar = normalizeUrl(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm',
        }),
        { forceHttps: true }
      );

      console.log('AFTER normalizeUrl');

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      console.log('AFTER user = new User');

      const salt = await bcrypt.genSalt(10);

      console.log('AFTER bcrypt.genSalt(10)');

      user.password = await bcrypt.hash(password, salt);

      console.log('AFTER bcrypt.hash');

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      console.log('BEFORE in JWT sign');

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.log('Error in JWT sign');
            throw err;
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// GET USER INFORMATION
//  POST    /api/auth
//  PRIVATE

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user)
      return res
        .status(401)
        .json({ msg: 'Invalid token - authorization failed' });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
