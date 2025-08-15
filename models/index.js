const sequelize = require("../config/database");
const User = require("./user");

const initDB = async () => {
	await sequelize.sync({ alter: true });
	console.log("Database synced");
};

module.exports = { sequelize, User, initDB };
