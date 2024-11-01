const response = require('../utils/responses');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authRequired = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    response.makeResponsesError(res, `No token`, 'NoToken')
  } else {
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        response.makeResponsesError(res, `Invalid token`, 'InvalidToken');
      } else {
        req.user = user
        next();
      }
    })
  }
}

module.exports = {
  authRequired: authRequired
}; 