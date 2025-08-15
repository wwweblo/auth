const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
	username: { type: DataTypes.STRING, unique: true, allowNull: false },
	password: { type: DataTypes.STRING, allowNull: false },
	first_name: { type: DataTypes.STRING },
	last_name: { type: DataTypes.STRING },
	gender: { type: DataTypes.ENUM("male", "female", "other") },
	birthdate: { type: DataTypes.DATEONLY },
});

module.exports = User;
