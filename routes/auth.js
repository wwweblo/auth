const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ where: { username } });
	if (!user)
		return res.status(401).json({ message: "Неверный логин или пароль" });

	const valid = await bcrypt.compare(password, user.password);
	if (!valid)
		return res.status(401).json({ message: "Неверный логин или пароль" });

	const token = jwt.sign(
		{ id: user.id, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: "1h" },
	);
	res.json({ token });
});

module.exports = router;
