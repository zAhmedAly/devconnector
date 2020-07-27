const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  // console.log(token);
  if (!token)
    return res.status(401).json({ msg: 'No toekn - authorization failed' });

  try {
    jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (error)
        return res
          .status(401)
          .json({ msg: 'Invalid token - authorization failed' });
      req.user = decoded.user;
      next();
    });
  } catch (err) {
    console.log('Something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};
