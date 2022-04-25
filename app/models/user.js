const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../services/db')

const User = sequelize.define('User', {
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
  },
  lastlogin: {
    type: DataTypes.DATE,
  },
  email_verif_token: {
    type: DataTypes.STRING,
  },
});

(async () => {
  await User.sync()
})();

module.exports = User
