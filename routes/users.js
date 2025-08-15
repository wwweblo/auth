const express = require("express");
const router = express.Router();
const { User } = require("../models");
const authMiddleware = require("../middleware/auth");
const bcrypt = require("bcrypt");

router.use(authMiddleware);

// Получение списка пользователей с пагинацией и сортировкой
router.get("/", async (req, res) => {
	const { page = 1, limit = 10, sort = "username", order = "ASC" } = req.query;
	const offset = (page - 1) * limit;
	const users = await User.findAll({
		limit: parseInt(limit),
		offset,
		order: [[sort, order]],
	});
	res.json(users);
});

// Получение пользователя по id
router.get("/:id", async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });
	res.json(user);
});

// Создание нового пользователя
router.post("/", async (req, res) => {
	const { username, password, first_name, last_name, gender, birthdate } =
		req.body;
	const hash = await bcrypt.hash(password, 10);
	try {
		const user = await User.create({
			username,
			password: hash,
			first_name,
			last_name,
			gender,
			birthdate,
		});
		res.json(user);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Редактирование пользователя
router.put("/:id", async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });

	const { password, ...rest } = req.body;
	if (password) rest.password = await bcrypt.hash(password, 10);
	await user.update(rest);
	res.json(user);
});

// Удаление пользователя
router.delete("/:id", async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });
	await user.destroy();
	res.json({ message: "Пользователь удален" });
});

module.exports = router;
