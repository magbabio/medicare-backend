const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Follow } = require('../models');
const resp = require('../utils/responses')
const validate = require('../utils/validate')
const authenticateToken = require('../middlewares/authenticateToken');


const login = async (req, res) => {
  try {

    console.log("Service login")
    const { username, password } = req.body;

    const valUser = await User.findOne({
      where: {
        username
      }
    });

    if (!valUser) {
      return resp.makeResponsesError(res, 'Incorrect credentials', 'ULoginError1')
    }

    const { id } = valUser;

    const valPass = await validate.comparePassword(password, valUser.password)

    if (!valPass) {
      return resp.makeResponsesError(res, 'Incorrect credentials', 'ULoginError2')
    }

    const secret = process.env.SECRET_KEY
    const token = jwt.sign({ id, }, secret, { expiresIn: '1w' });

    const user = {
      id,
      token
    }

    resp.makeResponsesOkData(res, user, 'Success')

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
}

module.exports = {
  createUser,
  login,
  getAllUsers,
  setFavorite,
  getFavoritesByUser,
  setFollow,
  getFollowersByUser,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  updateUserImage,
  getUserProfileImage,
  getUserLogged,
};