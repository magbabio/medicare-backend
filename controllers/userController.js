const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, Follow } = require('../models');
const resp = require('../utils/responses')
require('dotenv').config();


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const valUser = await User.findOne({
      where: { email }
    });

    if (!valUser) {
      return resp.makeResponsesError(res, 'Incorrect credentials', 'ULoginError1');
    }

    const { id, password: hashedPassword, role } = valUser; 

    const valPass = await bcrypt.compare(password, hashedPassword);

    if (!valPass) {
      return resp.makeResponsesError(res, 'Incorrect credentials', 'ULoginError2');
    }

    const secret = process.env.SECRET_KEY;

    // aca era 1w pero lo cambie a 1h intentando arreglar el error del token expired en el front
    const token = jwt.sign({ id, role }, secret, { expiresIn: '1h' });

    const user = { id, token };
    resp.makeResponsesOkData(res, user, 'Success');

  } catch (error) {
    console.log(error);
    resp.makeResponsesError(res, 'Unexpected error', 'UnexpectedError');
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        deletedAt: null
      },
      order: [['updatedAt']]
    });

    resp.makeResponsesOkData(res, users, 'Success')

  } catch (error) {
    resp.makeResponsesError(res, error, 'UnexpectedError')
  }
};

module.exports = {
  //createUser,
  login,
  getAllUsers,
  // setFavorite,
  // getFavoritesByUser,
  // setFollow,
  // getFollowersByUser,
  // getUser,
  // updateUser,
  // deleteUser,
  // changePassword,
  // updateUserImage,
  // getUserProfileImage,
  // getUserLogged,
};